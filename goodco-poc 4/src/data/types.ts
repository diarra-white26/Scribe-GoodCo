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

export interface AgentScript {
  agentId: string;
  agentName: string;
  agentRole: string;
  agentActionBullets: string[];
}

export interface TicketArtifact {
  kind: 'ticket-categorization';
  versionLabel: string;
  ticket: { subject: string; body: string; requester: string };
  before: { category: string; product: string; priority: string };
  after: {
    category: string;
    product: string;
    priority: string;
    confidence: number;
    queue: string;
  };
}

export interface ReplyArtifact {
  kind: 'drafted-reply';
  versionLabel: string;
  intent: string;
  accountLookup: { customer: string; lastLogin: string; ssoProvider: string };
  draftReply: string;
  confidence: number;
  agentAction: 'auto-resolved' | 'escalated-tier-2';
}

export type StageArtifact = TicketArtifact | ReplyArtifact;

export interface ChatMessage {
  from: 'customer' | 'virtual-agent' | 'real-agent';
  text: string;
}

/**
 * The two concrete outcomes of the Tier-1 auto-resolution model: the default
 * path (virtual agent handles it end to end in chat, no human involved) and
 * the exception path (escalates to a RealAgent, who receives the full prior
 * chat history and context rather than a cold handoff).
 */
export interface ResolutionViews {
  autoResolved: {
    label: string;
    confidence: number;
    messages: ChatMessage[];
    footer: string;
  };
  escalated: {
    label: string;
    trigger: string;
    confidence: number;
    priorChat: ChatMessage[];
    analystContext: string[];
    realAgentReply: string;
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
  evalLines: string[];
  contextOut: ContextChip[];
  inheritsFrom?: string[];
  reuseRationale?: Record<string, string>;
  cxoReuseRationale?: Record<string, string>;
  artifact: StageArtifact;
  resolutionViews?: ResolutionViews;
  /** Additive analyst-facing queue preview, shown alongside the artifact card. Stage 1 only. */
  analystQueuePreview?: {
    before: string;
    after: { subject: string; tags: string[]; priority: string };
  };
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
