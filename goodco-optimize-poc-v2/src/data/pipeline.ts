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
      businessPurpose: 'Support ticket volume has doubled. Agents spend time sorting before they ever start resolving.',
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
        'Manual triage industry-wide misroutes 23 to 35% of tickets and costs agents roughly 40% of their time; this stage targets that time directly',
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
      heroStat: { label: 'Hours recovered per week', before: '0, fully manual today', after: '14 (Optimize estimate)' },
    },
    {
      id: 'stage-2-autodraft',
      index: 1,
      label: 'Stage 2 · Auto-draft Tier-1 reply',
      shortLabel: 'Auto-draft reply',
      oneLine: 'Using the classification from Stage 1, the agent drafts a reply and hands it to a person to review and send.',
      businessPurpose: 'About 34% of Support volume is a handful of near-identical Tier-1 requests. Agents currently write these by hand every time.',
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
          agentName: 'Reply drafter',
          agentRole: 'Looks up the account, drafts the reply',
          agentActionBullets: [
            'Reads the intent carried over from Stage 1: SSO re-provisioning',
            "Looks up the customer's account status, last login, and SSO provider through the admin API",
            'Selects the matching template from the 8 Tier-1 intents and fills in the account-specific details',
            'Surfaces the draft in the agent’s queue; the agent reviews and clicks send, no auto-send in this version',
          ],
        },
      ],
      evalLines: [
        'Well-configured Tier-1 automation resolves 80 to 95% of password and account-access cases without a person writing the reply from scratch',
        'Forrester estimates each manual password reset costs about $70 in help-desk labor; this stage targets that cost directly',
        'Kept human-reviewed by design in v1: the agent always clicks send, this is an assist, not an autonomous reply',
      ],
      contextOut: [
        {
          id: 'chip-reply-drafted',
          label: 'Reply drafted: SSO reset steps, 0.91 confidence',
          detail: 'Draft ready in the agent queue. Median handle time drops once agents are reviewing instead of writing from scratch.',
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
        agentAction: 'queued-for-review',
      },
      heroStat: { label: 'Hours recovered per week', before: '0, fully manual today', after: '11 (Optimize estimate)' },
    },
  ],
};
