import type { Pipeline } from './types';

export const pipeline: Pipeline = {
  id: 'goodco-support-pipeline',
  title: 'Support ticket intelligence',
  subtitle: 'GoodCo · Optimize recommendation, phased rollout',
  wrapHero: 'One classifier, two connected stages, 25 hours a week back from the most-observed pattern in the Optimize output.',
  wrapStats: [
    { label: 'Hours recovered per week', before: '0 automated', after: '25 (14 + 11)' },
    { label: 'Workflows observed', before: '—', after: '38 of 141 captured' },
    { label: 'Confidence', before: '—', after: 'High on both stages' },
  ],
  stages: [
    {
      id: 'stage-1-categorize',
      index: 0,
      label: 'Stage 1 · Auto-categorize inbound tickets',
      shortLabel: 'Categorize',
      oneLine: 'A classifier reads every new ticket and applies category, product area, and priority at intake.',
      businessPurpose: 'Support ticket volume has doubled. Analysts spend time sorting before they ever start resolving.',
      sources: [
        { id: 'src-zendesk-queue', label: 'Zendesk ticket queue', detail: 'Live inbound tickets, all channels' },
        { id: 'src-zendesk-history', label: '18 months resolved tickets', detail: '≈45,000 tickets used as classifier training data' },
      ],
      scripts: [
        {
          agentId: 'classifier',
          agentName: 'Triage classifier',
          agentRole: 'Reads new ticket text, predicts labels',
          agentActionBullets: [
            'Reads the incoming ticket subject and body as plain text',
            'Predicts category, product area, and priority from patterns learned on 18 months of resolved tickets',
            'Applies tags automatically when confidence is 0.85 or higher',
            'Leaves anything below that threshold in the human triage queue, unchanged from today',
          ],
        },
      ],
      evalLines: [
        'Trained on the most-observed pattern in the Optimize output: 22 recorded instances, more evidence than any other recommendation',
        'A taxonomy of 8 to 15 categories with 3 to 5 subcategories typically reaches about 92% routing accuracy; broader taxonomies drop toward 78%',
        'Manual triage industry-wide misroutes 23 to 35% of tickets and costs analysts roughly 40% of their time; this stage targets that time directly',
      ],
      contextOut: [
        {
          id: 'chip-ticket-classified',
          label: 'Ticket classified: account access, Tier-1, high priority',
          detail: 'Category, product area, and priority applied at 0.94 confidence. Routed straight to the Tier-1 queue with no human triage step.',
          fromStageId: 'stage-1-categorize',
          emoji: 'check',
        },
      ],
      artifact: {
        kind: 'ticket-categorization',
        versionLabel: 'v1',
        ticket: {
          requester: 'facilities.lead@clientco.com',
          subject: "Can't log in, SSO keeps failing",
          body: "Hi, I've been trying to log into the visitor management dashboard since this morning and keep getting an SSO error. Can someone reset this or tell me what's going on? Need to get badges printed for a group arriving at 1pm.",
        },
        before: { category: 'Unsorted', product: '—', priority: 'Unset' },
        after: {
          category: 'Account access',
          product: 'SSO / Login',
          priority: 'Tier-1 · high',
          confidence: 0.94,
          queue: 'Tier-1 Support',
        },
      },
      analystQueuePreview: {
        before: 'Analysts open each new ticket cold and read it before they know what it even is.',
        after: {
          subject: "Can't log in, SSO keeps failing",
          tags: ['Account access', 'SSO / Login', 'Tier-1 · high'],
          priority: 'Tier-1 · high',
        },
      },
      heroStat: { label: 'Hours recovered per week', before: '0, fully manual today', after: '14 (Optimize estimate)' },
    },
    {
      id: 'stage-2-autodraft',
      index: 1,
      label: 'Stage 2 · Resolve Tier-1 automatically',
      shortLabel: 'Auto-resolve',
      oneLine: 'Using the classification from Stage 1, a virtual agent resolves the request directly in chat. Only exceptions reach a person.',
      businessPurpose: 'About 34% of Support volume is a handful of near-identical Tier-1 requests. Analysts currently write these replies by hand every time.',
      sources: [
        { id: 'src-admin-api', label: 'Admin lookup API', detail: 'Account status, last login, SSO provider' },
        { id: 'src-template-library', label: 'Reply template library', detail: '8 Tier-1 intents: password reset, SSO re-provision, 2FA reset, seat transfer, and others' },
      ],
      inheritsFrom: ['chip-ticket-classified'],
      reuseRationale: {
        'chip-ticket-classified': 'needed to know this is an SSO re-provisioning request before picking the right reply template',
      },
      scripts: [
        {
          agentId: 'drafter',
          agentName: 'Virtual agent',
          agentRole: 'Looks up the account, resolves the request in chat',
          agentActionBullets: [
            'Reads the intent carried over from Stage 1: SSO re-provisioning',
            "Looks up the customer's account status, last login, and SSO provider through the admin API",
            'Resolves Tier-1 requests directly in chat by default, no analyst touches these',
            'Escalates to a Tier-2 analyst only when confidence is below 0.85 or the account lookup shows something atypical, carrying the full chat history forward so nothing has to be repeated',
          ],
        },
      ],
      evalLines: [
        'Well-configured Tier-1 automation resolves 80 to 95% of password and account-access cases without a person writing the reply from scratch',
        'Forrester estimates each manual password reset costs about $70 in help-desk labor; this stage targets that cost directly',
        'Tier-1 is automatic by default in this design, not human-reviewed by default. The safety valve is the escalation path, not a person checking every case.',
      ],
      contextOut: [
        {
          id: 'chip-reply-drafted',
          label: 'Resolved automatically: SSO re-provisioned, 0.91 confidence',
          detail: 'Closed in chat with no analyst involved. Escalations carry the full chat history so nothing is repeated.',
          fromStageId: 'stage-2-autodraft',
          emoji: 'send',
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
            { from: 'customer', text: "Hi, I can't log into the visitor management dashboard, keep getting an SSO error. Need to print badges for a group arriving at 1pm." },
            { from: 'virtual-agent', text: "I can see your Okta SSO connection dropped on our end, I've just re-provisioned it. Can you try logging in again now?" },
            { from: 'customer', text: 'That worked, thank you!' },
            { from: 'virtual-agent', text: "Glad it's sorted. I'll be here if anything else comes up before your 1pm." },
          ],
          footer: 'Resolved automatically. No analyst involved. Confidence 0.91, above the 0.85 auto-resolve threshold.',
        },
        escalated: {
          label: 'Tier-2 · escalated to a real analyst',
          trigger: "Account lookup shows 4 failed SSO attempts from a new device in the last hour, a possible security event, not a routine re-provisioning request.",
          confidence: 0.52,
          priorChat: [
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
