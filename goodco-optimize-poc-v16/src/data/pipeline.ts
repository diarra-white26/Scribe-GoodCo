import type { Pipeline } from './types';

/**
 * This is deliberately framed around ONE moment: a new ticket arriving today,
 * and the three mutually-exclusive outcomes the virtual agent produces for
 * it. It is not a batch-classification pipeline for the existing ticket
 * backlog, and these are not sequential process steps — Path A, Path B1, and
 * Path B2 are alternate endings for the same kind of incoming ticket, exactly
 * like the approval-request Path A / Path B split used in the Valon
 * walkthrough, now with the Tier-2 routing lane split in two:
 *   - Path B1: a Tier-1-looking ticket starts down the automated path, then
 *     turns risky mid-flow. The agent stops short of pushing it through and
 *     hands off, with a human confirming the outcome before anything on the
 *     account changes.
 *   - Path B2: a ticket that was never a Tier-1 candidate at all. The agent
 *     recognizes that immediately and hands off with no failed auto-resolve
 *     attempt first.
 */
export const pipeline: Pipeline = {
  id: 'goodco-support-workflow',
  title: 'Support Ticket Handling: Future state solution POC',
  subtitle: 'GoodCo · Optimize recommendation, Tier-1 Support Agent & Tier-2+ Support Management Agent',
  wrapHero: 'Same virtual agent, three honest endings: most new tickets close themselves, some turn risky mid-flow and hand off with a human confirming the outcome, and some were never Tier-1 to begin with. 25 hours a week back from the most-observed pattern in the Optimize output.',
  wrapStats: [
    { label: 'Hours recovered per week', before: '0 automated', after: '25 (14 + 11)' },
    { label: 'Workflows observed', before: '—', after: '38 of 141 captured' },
    { label: 'Confidence', before: '—', after: 'High on Path A, human-confirmed on both Tier-2 paths' },
  ],
  stages: [
    {
      id: 'path-a-auto-resolved',
      index: 0,
      label: 'Path A · Resolved automatically',
      shortLabel: 'Path A',
      oneLine: 'A Tier-1 ticket comes in. The virtual agent classifies it, looks up the account, and resolves it end-to-end in chat. No analyst ever sees it.',
      businessPurpose: 'About 34% of Support volume is a handful of near-identical Tier-1 requests. This is the future state for that slice: the default outcome, not the exception.',
      sources: [
        { id: 'src-zendesk-queue', label: 'Zendesk ticket queue', detail: 'Live inbound tickets, all channels' },
        { id: 'src-admin-api', label: 'Admin lookup API', detail: 'Account status, last login, SSO provider' },
        { id: 'src-template-library', label: 'Reply template library', detail: 'Optimize names 8 Tier-1 intents; the first 5 are templated here: password reset, account lockout, SSO re-provisioning, 2FA reset, seat transfer' },
      ],
      scripts: [
        {
          agentId: 'virtual-agent',
          agentName: 'Virtual agent',
          agentRole: 'Classifies, looks up the account, resolves in chat',
          agentSteps: [
            {
              title: 'Classifies the ticket',
              detail: [
                'Tags category, product area, intent, urgency',
                "Trained on 18 months of GoodCo's resolved tickets",
                'Urgency bumped up for real deadlines, e.g. 1pm badge printing',
                'Auto-resolve requires confidence ≥ 0.85',
              ],
            },
            {
              title: 'Looks up the account',
              detail: [
                'Calls the admin API',
                'Pulls account status, last login, SSO provider',
                'Same lookup an analyst would do by hand today',
              ],
            },
            {
              title: 'Executes the fix',
              detail: [
                "Calls Okta's admin API directly",
                'Re-provisions the SSO connection on the account',
                'This is the actual system change, not a reply',
                'One of 5 pre-approved, reversible Tier-1 actions',
              ],
            },
            {
              title: 'Confirms in chat',
              detail: [
                'Replies to the customer once the fix is applied',
                'Confirms the specific action taken',
              ],
            },
            {
              title: 'Closes the ticket',
              detail: [
                'Closes automatically once customer confirms',
                'No analyst touches this path',
                'Default outcome for Tier-1, not the exception',
              ],
            },
          ],
        },
      ],
      contextOut: [
        {
          id: 'chip-path-a-resolved',
          label: 'Resolved automatically: SSO re-provisioned, Tier-1 · high, 0.91 confidence',
          detail: 'Classified, looked up, and closed in chat with no analyst involved.',
          fromStageId: 'path-a-auto-resolved',
          emoji: 'check',
        },
        {
          id: 'chip-path-a-account-health',
          label: 'Account health signal for Sales: clean resolution, no renewal-risk flag on ClientCo',
          detail: "The same classification and resolution data that closes the ticket also feeds the account health view Sales and CS already watch for renewal risk, no separate reporting step required.",
          fromStageId: 'path-a-auto-resolved',
          emoji: 'chart',
        },
        {
          id: 'chip-path-a-product-signal',
          label: 'Product signal: only 34% of Support volume is Tier-1, below industry benchmark',
          detail: "That leaves the majority landing in Tier-2, more than typical for a support queue this size. Some of that is genuine complexity, but a heavier-than-usual Tier-2 mix can also mean self-serve gaps or product friction. The same classification data feeds a queue-composition view Product could use to spot which recurring Tier-2 intents are worth a root-cause fix, not just faster triage.",
          fromStageId: 'path-a-auto-resolved',
          emoji: 'gap',
        },
      ],
      artifact: {
        kind: 'drafted-reply',
        versionLabel: 'v1',
        intent: 'SSO re-provisioning',
        priority: 'Tier-1 · high',
        accountLookup: {
          customer: 'ClientCo · Facilities Lead',
          detail: [
            { label: 'Last login', value: '14 days ago' },
            { label: 'SSO provider', value: 'Okta' },
          ],
        },
        confidence: 0.91,
        agentAction: 'auto-resolved',
      },
      resolutionViews: {
        autoResolved: {
          label: 'Tier-1 · handled fully by the virtual agent',
          confidence: 0.91,
          messages: [
            {
              from: 'virtual-agent',
              text: 'Thank you for reaching out to GoodCo Support! How can I help you today?',
              options: ["I can't log in", 'Reset my password', 'Something else with my account', 'Other'],
            },
            { from: 'customer', text: "I can't log in", isQuickReply: true },
            { from: 'virtual-agent', text: 'Sorry about that, let’s get you sorted. Can you tell me a bit more about what’s happening?' },
            { from: 'customer', text: "I can't log into the visitor management dashboard, keep getting an SSO error. Need to print badges for a group arriving at 1pm." },
            { from: 'virtual-agent', text: "I can see your Okta SSO connection dropped on our end, I've just re-provisioned it. Can you try logging in again now?" },
            { from: 'customer', text: 'That worked, thank you!' },
            { from: 'virtual-agent', text: "Glad it's sorted. I'll be here if anything else comes up before your 1pm." },
          ],
          footer: 'Resolved automatically. No analyst involved. Confidence 0.91, above the 0.85 auto-resolve threshold.',
        },
      },
      heroStat: { label: 'Hours recovered per week', before: '0, fully manual today', after: '14 (Optimize estimate)' },
    },
    {
      id: 'path-b1-escalated-from-tier1',
      index: 1,
      label: 'Path B1 · Routed from a Tier-1 attempt',
      shortLabel: 'Path B1',
      oneLine: "A Tier-1-looking ticket starts down the automated path, but the account lookup shows something isn't right. The agent stops short of resolving it and hands a real analyst the full context before anything on the account changes.",
      businessPurpose: "This is what happens when a Tier-1 case turns risky mid-flow: the agent doesn't push through and auto-resolve anyway. It stops, flags the anomaly, and puts a person in the loop before anything changes on the account. Analysts still own the exceptions Tier-1 automation shouldn't touch.",
      sources: [
        { id: 'src-admin-api-2', label: 'Admin lookup API', detail: 'Account status, last login, SSO provider' },
        { id: 'src-escalation-queue-b1', label: 'Tier-2 queue', detail: 'Where flagged tickets land with full context attached' },
      ],
      scripts: [
        {
          agentId: 'virtual-agent',
          agentName: 'Virtual agent',
          agentRole: 'Attempts the same lookup, recognizes the risk, hands off with a human confirming the outcome',
          agentSteps: [
            {
              title: 'Looks up the account',
              detail: [
                'Same classification and account lookup as Path A',
                'Same urgency call: access-blocking, so high either way',
              ],
            },
            {
              title: 'Flags the exception',
              detail: [
                '4 failed SSO attempts from a new device, last hour',
                'Confidence drops to 0.52, below the 0.85 threshold',
                'Reads as a possible security event, not a routine reset',
                'Stops here — never calls the reset/re-provision action',
              ],
            },
            {
              title: 'Packages the context',
              detail: [
                'Bundles chat transcript, account lookup, flag reason',
                'One handoff, not a summary the analyst rebuilds',
              ],
            },
            {
              title: 'Routes to Tier-2',
              detail: [
                'Hands to a human analyst with everything attached',
                'Customer never has to repeat themselves',
                'Account only changes once a person confirms it should',
              ],
            },
          ],
        },
      ],
      contextOut: [
        {
          id: 'chip-path-b1-escalated',
          label: 'Routed to Tier-2: unusual sign-in activity, Tier-1 · high, 0.52 confidence',
          detail: 'Full chat history and account context handed to the analyst, nothing repeated to the customer.',
          fromStageId: 'path-b1-escalated-from-tier1',
          emoji: 'send',
        },
        {
          id: 'chip-path-b1-security-flag',
          label: 'Security review: repeated failed sign-in flagged on an enterprise account',
          detail: 'The same flag reason handed to the Tier-2 analyst also lands in the security log Security already reviews for anomalous account activity, no separate report needed.',
          fromStageId: 'path-b1-escalated-from-tier1',
          emoji: 'shield',
        },
        {
          id: 'chip-path-b1-product-signal',
          label: 'Product signal: only 34% of Support volume is Tier-1, below industry benchmark',
          detail: "This ticket is a Tier-2 exception for a good reason (security), but a lot of Tier-2 volume isn't. The same queue-composition data flags which recurring non-Tier-1 intents are frequent enough that Product could investigate a root-cause fix.",
          fromStageId: 'path-b1-escalated-from-tier1',
          emoji: 'gap',
        },
      ],
      artifact: {
        kind: 'drafted-reply',
        versionLabel: 'v1',
        intent: 'Account access, flagged for review',
        priority: 'Tier-1 · high · security flag',
        accountLookup: {
          customer: 'Unrecognized device, last 60 min',
          detail: [
            { label: 'Lookup result', value: 'Unusual pattern detected' },
            { label: 'SSO provider', value: 'Okta' },
          ],
        },
        confidence: 0.52,
        agentAction: 'escalated-tier-2',
      },
      resolutionViews: {
        escalated: {
          label: 'Tier-2 · routed to a real analyst',
          trigger: "Account lookup shows 4 failed SSO attempts from a new device in the last hour, a possible security event, not a routine re-provisioning request.",
          confidence: 0.52,
          priorChat: [
            {
              from: 'virtual-agent',
              text: 'Thank you for reaching out to GoodCo Support! How can I help you today?',
              options: ["I can't log in", 'Reset my password', 'Something else with my account', 'Other'],
            },
            { from: 'customer', text: "I can't log in", isQuickReply: true },
            { from: 'virtual-agent', text: 'Sorry about that, let’s get you sorted. Can you tell me a bit more about what’s happening?' },
            { from: 'customer', text: "I can't get into my account, it keeps saying access denied, this is urgent." },
            { from: 'virtual-agent', text: "I'm seeing some unusual sign-in activity on this account in the last hour. I want to make sure it's really you before I re-provision anything, so I'm looping in a member of our team." },
          ],
          analystContext: [
            'Full chat transcript above, nothing needs to be repeated to the customer',
            'Account status, last login, and SSO provider already looked up',
            'Flag reason: 4 failed attempts from an unrecognized device in the last 60 minutes',
          ],
          recommendedNextStep:
            'Verify identity by phone before re-provisioning. If confirmed, clear the device and restore access; if not, lock the account and loop in Security.',
          draftEmail:
            "Hi, this is Priya from GoodCo support. I can see you're having trouble getting in, and I want to quickly verify it's you before I make any changes, given some unusual activity we spotted. Can you confirm the last four digits of the phone number on your account?",
        },
      },
      heroStat: { label: 'Hours recovered per week', before: '0, fully manual today', after: '11 (Optimize estimate)' },
    },
    {
      id: 'path-b2-tier2-from-start',
      index: 2,
      label: 'Path B2 · Tier-2 from the start',
      shortLabel: 'Path B2',
      oneLine: "A different kind of ticket entirely, a building hardware fault, not a login request. The agent recognizes it's outside Tier-1 scope immediately and hands a real analyst the full context, no failed auto-resolve attempt first.",
      businessPurpose: "This is the other kind of exception: tickets that were never Tier-1 candidates to begin with, hardware faults, physical access-control issues, anything outside the known Tier-1 intents from the first message. Analysts still own these, with full context attached instead of a cold handoff.",
      sources: [
        { id: 'src-zendesk-queue-b2', label: 'Zendesk ticket queue', detail: 'Live inbound tickets, all channels' },
        { id: 'src-escalation-queue-b2', label: 'Tier-2 queue', detail: 'Where flagged tickets land with full context attached' },
      ],
      scripts: [
        {
          agentId: 'virtual-agent',
          agentName: 'Virtual agent',
          agentRole: 'Classifies, recognizes this is outside Tier-1 scope, routes immediately',
          agentSteps: [
            {
              title: 'Classifies the ticket',
              detail: [
                'Same classification step as every new ticket',
                "Doesn't match any known Tier-1 intent",
                'No auto-resolve attempt, no action ever called',
                'Urgency high: blocks physical access for a group',
              ],
            },
            {
              title: 'Packages the context',
              detail: [
                'Bundles the full ticket thread: floor, symptom, timing',
                'One handoff, not a summary to reconstruct',
                "Doesn't investigate the hardware itself",
              ],
            },
            {
              title: 'Routes to Tier-2 immediately',
              detail: [
                'Routes straight to a specialist, everything attached',
                'No diagnostic or resolution attempt first',
                'Job is to recognize scope fast, not investigate',
              ],
            },
          ],
        },
      ],
      contextOut: [
        {
          id: 'chip-path-b2-escalated',
          label: 'Routed to Tier-2 immediately: badge reader outage reported, Tier-2 · high, outside known Tier-1 intents',
          detail: 'Full ticket thread and reported symptoms handed to the analyst, nothing repeated to the customer, no diagnostic attempted by the agent.',
          fromStageId: 'path-b2-tier2-from-start',
          emoji: 'send',
        },
        {
          id: 'chip-path-b2-security-flag',
          label: 'Security review: physical access-control incident logged for the 4th floor engineering wing',
          detail: 'The same incident details handed to the Tier-2 analyst also feed the physical security incident log Security already reviews for building access anomalies, no separate report needed.',
          fromStageId: 'path-b2-tier2-from-start',
          emoji: 'shield',
        },
        {
          id: 'chip-path-b2-product-signal',
          label: 'Product signal: only 34% of Support volume is Tier-1, below industry benchmark',
          detail: "Tickets like this one, never a Tier-1 candidate at all, are exactly the kind of recurring pattern the queue-composition view is built to surface. If hardware faults like this show up often enough, that's a signal for the product/hardware team to investigate, not just a ticket to route faster.",
          fromStageId: 'path-b2-tier2-from-start',
          emoji: 'gap',
        },
      ],
      artifact: {
        kind: 'drafted-reply',
        versionLabel: 'v1',
        intent: 'Physical access-control hardware fault',
        priority: 'Tier-2 · high',
        accountLookup: {
          customer: 'ClientCo · 4th Floor Engineering Wing',
          detail: [
            { label: 'Affected site', value: '4th floor, engineering wing' },
            { label: 'Reported symptom', value: '6 readers denying badge-ins since ~9am' },
          ],
        },
        confidence: 0.12,
        agentAction: 'escalated-tier-2',
      },
      resolutionViews: {
        escalated: {
          label: 'Tier-2 · routed to a real analyst',
          trigger: "Multiple badge readers on one floor are denying valid badge-ins, reported by the customer, a hardware and access-control fault outside any known Tier-1 intent, not a routine account request.",
          confidence: 0.12,
          priorChat: [
            {
              from: 'virtual-agent',
              text: 'Thank you for reaching out to GoodCo Support! How can I help you today?',
              options: ["I can't log in", 'Reset my password', 'Something else with my account', 'Other'],
            },
            { from: 'customer', text: 'Other', isQuickReply: true },
            { from: 'virtual-agent', text: "Got it, tell me a bit more about what's going on." },
            { from: 'customer', text: 'Multiple badge readers on our 4th floor stopped unlocking around 9am. About 30 people are locked out of the engineering wing right now.' },
            { from: 'virtual-agent', text: "Thanks for the detail, this looks like a hardware or access-control issue rather than an account request, so I'm looping in a specialist on our team right away with everything you've shared." },
          ],
          analystContext: [
            'Full ticket thread above, nothing needs to be repeated to the customer',
            'Affected site: 4th floor, engineering wing, 6 badge readers on that segment',
            'No diagnostic run yet by the agent, this was routed immediately since it was never a Tier-1 candidate',
          ],
          recommendedNextStep:
            'Run a remote connectivity check on the affected readers first; if that clears it, confirm with the customer before closing. If not, dispatch a technician given the number of employees affected.',
          draftEmail:
            "Hi, this is Priya from GoodCo support. I can see the readers on your 4th floor engineering wing are denying badge-ins since this morning. I'm running some checks now and will update you as soon as I know more.",
        },
      },
      heroStat: { label: 'Hours recovered per week', before: '0, always manual today', after: '0 (not part of the Tier-1 hours estimate, shown for contrast)' },
    },
  ],
};
