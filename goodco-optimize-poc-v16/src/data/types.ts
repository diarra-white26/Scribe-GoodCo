export interface ContextChip {
  id: string;
  label: string;
  detail: string;
  cxoDetail?: string;
  emoji?: string;
  fromStageId: string;
}

export interface StageSource {
  id: string;
  label: string;
  detail?: string;
}

export interface AgentStep {
  title: string;
  /** Shown as a short bullet list on the back of the flip-card when a person
   *  clicks the step. Kept to 2-4 short bullets so the card doesn't scroll. */
  detail: string[];
}

export interface AgentScript {
  agentId: string;
  agentName: string;
  agentRole: string;
  agentSteps: AgentStep[];
}

export interface ReplyArtifact {
  kind: 'drafted-reply';
  versionLabel: string;
  intent: string;
  /** Set at classification time, alongside category and product area. See the
   *  first Agent Execution step for how urgency is derived. */
  priority: string;
  /** Generic lookup fields so this same shape covers an account/SSO lookup
   *  (Path A) or a site/device lookup (Path B) without forcing every ticket
   *  into account-access language. */
  accountLookup: { customer: string; detail: { label: string; value: string }[] };
  confidence: number;
  agentAction: 'auto-resolved' | 'escalated-tier-2';
}

export type StageArtifact = ReplyArtifact;

export interface ChatMessage {
  from: 'customer' | 'virtual-agent' | 'real-agent';
  text: string;
  /** Quick-reply menu shown under this message, e.g. the automated intro
   *  greeting. Decorative in this walkthrough, shows the pattern rather than
   *  being clickable. */
  options?: string[];
  /** Marks this message as a customer's quick-reply selection (rendered as a
   *  small pill) rather than typed free text. */
  isQuickReply?: boolean;
}

/**
 * What a new ticket looks like from the outside once the virtual agent has
 * acted on it. Each Stage (Path A or Path B) populates exactly one of these,
 * never both — they are two mutually-exclusive outcomes for a new ticket,
 * not two sequential steps.
 */
export interface ResolutionViews {
  autoResolved?: {
    label: string;
    confidence: number;
    messages: ChatMessage[];
    footer: string;
  };
  escalated?: {
    label: string;
    trigger: string;
    confidence: number;
    priorChat: ChatMessage[];
    analystContext: string[];
    /** The clear, one-line recommendation the agent surfaces alongside the
     *  handoff, e.g. what to verify or decide before acting. */
    recommendedNextStep: string;
    /** Drafted email sitting in the analyst's sidebar, ready to review and
     *  send. Matches the source recommendation's "no auto-send in v1" design:
     *  the agent drafts, a person reviews and clicks Send. */
    draftEmail: string;
  };
}

export interface Stage {
  id: string;
  index: number;
  label: string;
  shortLabel: string;
  oneLine: string;
  businessPurpose: string;
  sources: StageSource[];
  scripts: AgentScript[];
  contextOut: ContextChip[];
  inheritsFrom?: string[];
  reuseRationale?: Record<string, string>;
  cxoReuseRationale?: Record<string, string>;
  artifact: StageArtifact;
  resolutionViews?: ResolutionViews;
  heroStat: { label: string; before: string; after: string };
}

export interface Pipeline {
  id: string;
  title: string;
  subtitle: string;
  stages: Stage[];
  wrapHero: string;
  wrapStats: { label: string; before: string; after: string }[];
}
