import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { pipeline } from './src/data/pipeline.ts';
import { IntroScreen } from './src/components/IntroScreen.tsx';
import { WrapScreen } from './src/components/WrapScreen.tsx';
import { AgentActivityPane } from './src/components/AgentActivityPane.tsx';
import { StageArtifactCard } from './src/components/StageArtifactCard.tsx';
import { AnalystView } from './src/components/AnalystView.tsx';

const checks = [
  ['IntroScreen', React.createElement(IntroScreen, { pipeline })],
  ['WrapScreen', React.createElement(WrapScreen, { pipeline })],
  [
    'AgentActivityPane Path A',
    React.createElement(AgentActivityPane, {
      pipelineId: pipeline.id,
      stage: pipeline.stages[0],
      inheritedChips: [],
      onChipsReady: () => {},
    }),
  ],
  [
    'AgentActivityPane Path B',
    React.createElement(AgentActivityPane, {
      pipelineId: pipeline.id,
      stage: pipeline.stages[1],
      inheritedChips: [],
      onChipsReady: () => {},
    }),
  ],
  ['StageArtifactCard Path A', React.createElement(StageArtifactCard, { artifact: pipeline.stages[0].artifact })],
  ['StageArtifactCard Path B', React.createElement(StageArtifactCard, { artifact: pipeline.stages[1].artifact })],
  ['AnalystView Path A', React.createElement(AnalystView, { stage: pipeline.stages[0] })],
  ['AnalystView Path B', React.createElement(AnalystView, { stage: pipeline.stages[1] })],
];

let failed = false;
for (const [name, el] of checks) {
  try {
    const html = renderToStaticMarkup(el);
    console.log(`OK  ${name}  (${html.length} chars)`);
  } catch (err) {
    failed = true;
    console.error(`FAIL ${name}`);
    console.error(err);
  }
}

console.log('\n--- content spot-check ---');
const pathAHtml = renderToStaticMarkup(
  React.createElement(AgentActivityPane, {
    pipelineId: pipeline.id,
    stage: pipeline.stages[0],
    inheritedChips: [],
    onChipsReady: () => {},
  }),
);
const pathBHtml = renderToStaticMarkup(
  React.createElement(AgentActivityPane, {
    pipelineId: pipeline.id,
    stage: pipeline.stages[1],
    inheritedChips: [],
    onChipsReady: () => {},
  }),
);

console.log('Path A shows only the customer chat (no escalation card):', pathAHtml.includes('What the customer sees') && !pathAHtml.includes('Why it escalated'));
console.log('Path A has no analyst involved:', pathAHtml.includes('No analyst involved') || pathAHtml.includes('no analyst involved'));
console.log('Path B mentions Virtual agent:', pathBHtml.includes('Virtual agent'));
console.log('Path B mentions Tier-2 escalation trigger:', pathBHtml.includes('failed SSO attempts'));
console.log('Path B mentions analyst reply:', pathBHtml.includes('Priya'));
console.log('Path B shows both customer view and analyst view label:', pathBHtml.includes('What the customer sees, then what the analyst sees'));
console.log('No leftover batch/categorization framing in Path A:', !pathAHtml.includes('45,000 tickets') && !pathAHtml.includes("Analyst's queue"));
console.log('No stray "ticket-categorization" artifact rendering:', !pathAHtml.includes('Before') || !pathAHtml.includes('After'));

console.log('\n--- six-point edit round spot-check ---');
console.log('No header preamble (oneLine/businessPurpose) before Pulling from:', !pathAHtml.includes('This is the future state for that slice') && !pathAHtml.includes('No analyst ever sees it.'));
console.log('Agent execution uses flip-card flow, not bullet list:', pathAHtml.includes('Click for detail') && !pathAHtml.includes("before:content-['•']"));
console.log('First Path A step folds in the removed volume/classification framing:', pathAHtml.includes('About 34% of Support volume'));
console.log('Eval card fully removed:', !pathAHtml.includes('mono text-[12px] tracking-[0.2em] uppercase text-ink-4">Eval<'));
console.log('Output card has a threshold disclosure:', pathAHtml.includes('Why 0.85?'));
console.log('Chat now rendered inside a chat-widget frame:', pathAHtml.includes('Type a message') && pathAHtml.includes('Support chat'));
console.log('Path B chat is one continuous thread with a system divider:', pathBHtml.includes('Escalated to Priya, Tier-2 support'));

process.exit(failed ? 1 : 0);
