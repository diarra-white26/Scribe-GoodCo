import type { Pipeline } from './types';

/**
 * This is deliberately framed around ONE moment: a new ticket arriving today,
 * and the two mutually-exclusive outcomes the virtual agent produces for it.
 * It is not a batch-classification pipeline for the existing ticket backlog,
 * and it is not two sequential process steps — Path A and Path B are
 * alternate endings for the same kind of incoming ticket, exactly like the
 * approval-request Path A / Path B split used in the Valon walkthrough.
 */
export const pipeline: Pipeline = {
  id: 'goodco-support-workflow',
  title: 'Support Ticket Handling: Future state solution POC',
  subtitle: 'GoodCo · Optimize recommendation, Tier-1 Support Agent & Tier-2+ Support Management Agent',
  wrapHero: 'Same virtual agent, two honest endings: most new tickets close themselves, the rest hand off with full context. 25 hours a week back from the most-observed pattern in the Optimize output.',
  wrapStats: [
    { label: 'Hours recovered per week', before: '0 automated', after: '25 (14 + 11)' },
    { label: 'Workflows observed', before: '—', after: '38 of 141 captured' },
    { label: 'Confidence', before: '—', after: 'High on both paths' },
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
        { id: 'src-template-library', label: 'Reply template library', detail: '8 Tier-1 intents: password reset, SSO re-provision, 2FA reset, seat transfer, and others' },
      ],
      scripts: [
        {
          agentId: 'virtual-agent',
          agentName: 'Virtual agent',
          agentRole: 'Classifies, looks up the account, resolves in chat',
          agentSteps: [
            {
              title: 'Classifies the ticket',
              detail: "About 34% of Support volume is a handful of near-identical Tier-1 requests: password resets, SSO re-provisioning, 2FA resets, seat transfers. The moment one like this arrives, the agent classifies category, product area, and intent, trained on 18 months of GoodCo's resolved tickets. Tags apply automatically once confidence is 0.85 or higher.",
            },
            {
              title: 'Looks up the account',
              detail: "Pulls account status, last login, and SSO provider through the admin API, the same lookup an analyst would do by hand today.",
            },
            {
              title: 'Resolves in chat',
              detail: 'Matches the classified intent to one of 8 known Tier-1 reply templates and responds directly to the customer in the same conversation.',
            },
            {
              title: 'Closes the ticket',
              detail: "No analyst touches this path. The ticket closes automatically once the customer confirms it's resolved. This is the default outcome for Tier-1, not the exception.",
            },
          ],
        },
      ],
      contextOut: [
        {
          id: 'chip-path-a-resolved',
          label: 'Resolved automatically: SSO re-provisioned, 0.91 confidence',
          detail: 'Classified, looked up, and closed in chat with no analyst involved.',
          fromStageId: 'path-a-auto-resolved',
          emoji: 'check',
        },
      ],
      artifact: {
        kind: 'drafted-reply',
        versionLabel: 'v1',
        intent: 'SSO re-provisioning',
        accountLookup: {
          customer: 'ClientCo · Facilities Lead',
          lastLogin: '14 days ago',
          ssoProvider: 'Okta',
        },
        draftReply:
          "Hi there, sorry for the trouble getting in today. I can see your Okta SSO connection needs a quick re-sync on our end, I've just re-provisioned it. Please try logging in again in the next few minutes, if the same error shows up, a full sign-out and back in on Okta's side usually clears it. Let me know if you're still stuck ahead of your 1pm arrival and I'll jump on a call.",
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
      id: 'path-b-escalated',
      index: 1,
      label: 'Path B · Escalated to an analyst',
      shortLabel: 'Path B',
      oneLine: 'A different ticket comes in that looks like the same request, but the account lookup shows something atypical. The agent stops, flags it, and hands a real analyst the full context.',
      businessPurpose: "This is the exception path, for cases the agent shouldn't resolve on its own: security-sensitive activity, low-confidence classification, anything outside the 8 known Tier-1 intents. Analysts still own these.",
      sources: [
        { id: 'src-admin-api-2', label: 'Admin lookup API', detail: 'Account status, last login, SSO provider' },
        { id: 'src-escalation-queue', label: 'Tier-2 escalation queue', detail: 'Where flagged tickets land with full context attached' },
      ],
      scripts: [
        {
          agentId: 'virtual-agent',
          agentName: 'Virtual agent',
          agentRole: 'Attempts the same lookup, recognizes the exception, escalates with context',
          agentSteps: [
            {
              title: 'Looks up the account',
              detail: "This is the exception path, for cases the agent shouldn't resolve on its own: security-sensitive activity, low-confidence classification, anything outside the 8 known Tier-1 intents. It starts the same way as Path A, with the same account lookup.",
            },
            {
              title: 'Flags the exception',
              detail: 'Recognizes the lookup is atypical: 4 failed SSO attempts from a new device in the last hour. Confidence drops to 0.52, below the 0.85 auto-resolve threshold.',
            },
            {
              title: 'Packages the context',
              detail: 'Bundles the full chat transcript, account lookup, and flag reason into one handoff, instead of a summary the analyst has to reconstruct from scratch.',
            },
            {
              title: 'Escalates to Tier-2',
              detail: 'Routes to a human analyst with everything attached, so the customer never has to repeat themselves. Analysts still own these exceptions.',
            },
          ],
        },
      ],
      contextOut: [
        {
          id: 'chip-path-b-escalated',
          label: 'Escalated to Tier-2: unusual sign-in activity, 0.52 confidence',
          detail: 'Full chat history and account context handed to the analyst, nothing repeated to the customer.',
          fromStageId: 'path-b-escalated',
          emoji: 'send',
        },
      ],
      artifact: {
        kind: 'drafted-reply',
        versionLabel: 'v1',
        intent: 'Account access, flagged for review',
        accountLookup: {
          customer: 'Unrecognized device, last 60 min',
          lastLogin: 'Unusual pattern detected',
          ssoProvider: 'Okta',
        },
        draftReply:
          "Hi, this is Priya from GoodCo support. I can see you're having trouble getting in, and I want to quickly verify it's you before I make any changes, given some unusual activity we spotted. Can you confirm the last four digits of the phone number on your account?",
        confidence: 0.52,
        agentAction: 'escalated-tier-2',
      },
      resolutionViews: {
        escalated: {
          label: 'Tier-2 · escalated to a real analyst',
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
          realAgentReply:
            "Hi, this is Priya from GoodCo support. I can see you're having trouble getting in, and I want to quickly verify it's you before I make any changes, given some unusual activity we spotted. Can you confirm the last four digits of the phone number on your account?",
        },
      },
      heroStat: { label: 'Hours recovered per week', before: '0, fully manual today', after: '11 (Optimize estimate)' },
    },
  ],
};
