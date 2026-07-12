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

export interface ReplyArtifact {
  kind: 'drafted-reply';
  versionLabel: string;
  intent: string;
  accountLookup: { customer: string; lastLogin: string; ssoProvider: string };
  draftReply: string;
  confidence: number;
  agentAction: 'auto-resolved' | 'escalated-tier-2';
}

export type StageArtifact = ReplyArtifact;

export interface ChatMessage {
  from: 'customer' | 'virtual-agent' | 'real-agent';
  text: string;
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
