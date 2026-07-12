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
    'AgentActivityPane stage 1',
    React.createElement(AgentActivityPane, {
      pipelineId: pipeline.id,
      stage: pipeline.stages[0],
      inheritedChips: [],
      onChipsReady: () => {},
    }),
  ],
  [
    'AgentActivityPane stage 2',
    React.createElement(AgentActivityPane, {
      pipelineId: pipeline.id,
      stage: pipeline.stages[1],
      inheritedChips: pipeline.stages[0].contextOut,
      onChipsReady: () => {},
    }),
  ],
  ['StageArtifactCard ticket', React.createElement(StageArtifactCard, { artifact: pipeline.stages[0].artifact })],
  ['StageArtifactCard reply', React.createElement(StageArtifactCard, { artifact: pipeline.stages[1].artifact })],
  ['AnalystView stage 1', React.createElement(AnalystView, { stage: pipeline.stages[0] })],
  ['AnalystView stage 2', React.createElement(AnalystView, { stage: pipeline.stages[1] })],
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
const stage2Html = renderToStaticMarkup(
  React.createElement(AgentActivityPane, {
    pipelineId: pipeline.id,
    stage: pipeline.stages[1],
    inheritedChips: pipeline.stages[0].contextOut,
    onChipsReady: () => {},
  }),
);
console.log('Stage 2 mentions Virtual agent:', stage2Html.includes('Virtual agent'));
console.log('Stage 2 mentions Tier-2 escalation trigger:', stage2Html.includes('failed SSO attempts'));
console.log('Stage 2 mentions analyst reply:', stage2Html.includes('Priya'));
console.log('No "queued-for-review" leftover language:', !stage2Html.includes('queued-for-review'));
console.log('Uses "analyst" not stray "agent" for humans:', stage2Html.includes('analyst'));

const railHtml = renderToStaticMarkup(
  React.createElement(AgentActivityPane, {
    pipelineId: pipeline.id,
    stage: pipeline.stages[1],
    inheritedChips: pipeline.stages[0].contextOut,
    onChipsReady: () => {},
  }),
);
console.log('Reusing row chip label has no width clamp:', !railHtml.includes('max-w-[260px]'));

process.exit(failed ? 1 : 0);
