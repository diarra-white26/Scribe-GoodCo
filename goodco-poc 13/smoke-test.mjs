import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { pipeline } from './src/data/pipeline.ts';
import { IntroScreen } from './src/components/IntroScreen.tsx';
import { WrapScreen } from './src/components/WrapScreen.tsx';
import { AgentActivityPane } from './src/components/AgentActivityPane.tsx';
import { StageArtifactCard } from './src/components/StageArtifactCard.tsx';
import { AnalystView } from './src/components/AnalystView.tsx';

const pane = (stage) =>
  React.createElement(AgentActivityPane, {
    pipelineId: pipeline.id,
    stage,
    inheritedChips: [],
    onChipsReady: () => {},
  });

console.log('Stage count is 3 (Path A, Path B1, Path B2):', pipeline.stages.length === 3);

const checks = [
  ['IntroScreen', React.createElement(IntroScreen, { pipeline })],
  ['WrapScreen', React.createElement(WrapScreen, { pipeline })],
  ['AgentActivityPane Path A', pane(pipeline.stages[0])],
  ['AgentActivityPane Path B1', pane(pipeline.stages[1])],
  ['AgentActivityPane Path B2', pane(pipeline.stages[2])],
  ['StageArtifactCard Path A', React.createElement(StageArtifactCard, { artifact: pipeline.stages[0].artifact })],
  ['StageArtifactCard Path B1', React.createElement(StageArtifactCard, { artifact: pipeline.stages[1].artifact })],
  ['StageArtifactCard Path B2', React.createElement(StageArtifactCard, { artifact: pipeline.stages[2].artifact })],
  ['AnalystView Path A', React.createElement(AnalystView, { stage: pipeline.stages[0] })],
  ['AnalystView Path B1', React.createElement(AnalystView, { stage: pipeline.stages[1] })],
  ['AnalystView Path B2', React.createElement(AnalystView, { stage: pipeline.stages[2] })],
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
const pathAHtml = renderToStaticMarkup(pane(pipeline.stages[0]));
const pathB1Html = renderToStaticMarkup(pane(pipeline.stages[1]));
const pathB2Html = renderToStaticMarkup(pane(pipeline.stages[2]));

console.log('Path A shows the customer script label (no routed-to-Tier-2 card):', pathAHtml.includes('Customer automated conversation script') && !pathAHtml.includes('Why it routed to Tier-2'));
console.log('Path A notes the script is channel-agnostic:', pathAHtml.includes('phone call, text message, or email reply'));
console.log('Path A has no analyst involved:', pathAHtml.includes('No analyst involved') || pathAHtml.includes('no analyst involved'));

console.log('Path B1 mentions Virtual agent:', pathB1Html.includes('Virtual agent'));
console.log('Path B1 is the Tier-1-turned-risky SSO scenario:', pathB1Html.includes('failed SSO attempts') && pathB1Html.includes('Okta'));
console.log('Path B1 makes the human-in-the-loop line explicit:', pathB1Html.includes('human-in-the-loop line'));
console.log('Path B1 mentions analyst reply:', pathB1Html.includes('Priya'));
console.log('Path B1 shows the analyst dashboard label:', pathB1Html.includes('Analyst dashboard'));
console.log('Path B1 surfaces a recommended next step:', pathB1Html.includes('Recommended next step') && pathB1Html.includes('Verify identity by phone'));
console.log('Path B1 shows a drafted email awaiting send, not already sent:', pathB1Html.includes('Drafted email, ready to send') && pathB1Html.includes('no auto-send'));
console.log('Path B1 no longer shows the removed decision/close-out section:', !pathB1Html.includes('ticket close-out') && !pathB1Html.includes('Final email sent') && !pathB1Html.includes('Edited before sending'));

console.log('Path B2 mentions Virtual agent:', pathB2Html.includes('Virtual agent'));
console.log('Path B2 is a genuinely different issue than Path A/B1 (no login/SSO scenario reused):', !pathB2Html.includes('Okta') && !pathB2Html.includes('sign-in activity') && !pathB2Html.includes('re-provision'));
console.log('Path B2 mentions the badge-reader hardware fault:', pathB2Html.includes('badge readers'));
console.log('Path B2 does not claim the agent ran its own diagnostic:', !pathB2Html.includes('Runs an initial diagnostic') && !pathB2Html.includes('Diagnostic pulled automatically') && !pathB2Html.includes('Likely cause'));
console.log('Path B2 agent execution is a lean 3-step classify/package/route flow:', pathB2Html.includes('Routes to Tier-2 immediately'));
console.log('Path B2 surfaces a recommended next step:', pathB2Html.includes('Recommended next step') && pathB2Html.includes('Run a remote connectivity check'));
console.log('Path B2 shows a drafted email awaiting send, not already sent:', pathB2Html.includes('Drafted email, ready to send') && pathB2Html.includes('no auto-send'));
console.log('Path B2 no longer shows the removed decision/close-out section:', !pathB2Html.includes('ticket close-out') && !pathB2Html.includes('Final email sent') && !pathB2Html.includes('Edited before sending'));

const b1SecurityChip = pipeline.stages[1].contextOut.find((c) => c.id === 'chip-path-b1-security-flag');
console.log('Path B1 security chip is Security-only, not Finance:', !!b1SecurityChip && b1SecurityChip.label.includes('Security') && !b1SecurityChip.label.includes('Finance') && !b1SecurityChip.detail.includes('Finance'));
const b2SecurityChip = pipeline.stages[2].contextOut.find((c) => c.id === 'chip-path-b2-security-flag');
console.log('Path B2 security chip is Security-only, not Finance:', !!b2SecurityChip && b2SecurityChip.label.includes('Security') && !b2SecurityChip.label.includes('Finance') && !b2SecurityChip.detail.includes('Finance'));
const salesChip = pipeline.stages[0].contextOut.find((c) => c.id === 'chip-path-a-account-health');
console.log('Path A still carries a Sales-relevant context chip:', !!salesChip && salesChip.label.includes('Sales'));

console.log('No leftover batch/categorization framing in Path A:', !pathAHtml.includes('45,000 tickets') && !pathAHtml.includes("Analyst's queue"));
console.log('No stray "ticket-categorization" artifact rendering:', !pathAHtml.includes('Before') || !pathAHtml.includes('After'));
console.log('Output card no longer duplicates the resolution/draft text:', !pathAHtml.includes('mono text-[12px] tracking-[0.18em] uppercase text-os">Resolution<'));

const totalHours = pipeline.stages.reduce((sum, s) => sum + Number(s.heroStat.after.split(' ')[0]), 0);
console.log('Total hours stat still sums to 25, no double count from splitting Path B:', totalHours === 25);

console.log('No rendered "escalate/escalated" copy anywhere (replaced with routed/routes):', ![pathAHtml, pathB1Html, pathB2Html].some((h) => /escalat/i.test(h)));

console.log('\n--- six-point edit round spot-check ---');
console.log('No header preamble (oneLine/businessPurpose) before Pulling from:', !pathAHtml.includes('This is the future state for that slice') && !pathAHtml.includes('No analyst ever sees it.'));
console.log('Agent execution uses flip-card flow, not bullet list:', pathAHtml.includes('Click for detail') && !pathAHtml.includes("before:content-['•']"));
console.log('First Path A step folds in the removed volume/classification framing:', pathAHtml.includes('About 34% of Support volume'));
console.log('Eval card fully removed:', !pathAHtml.includes('mono text-[12px] tracking-[0.2em] uppercase text-ink-4">Eval<'));
console.log('Output card has a threshold disclosure:', pathAHtml.includes('Why 0.85?'));
console.log('Chat now rendered inside a chat-widget frame:', pathAHtml.includes('Type a message') && pathAHtml.includes('Support chat'));
console.log('Path B1 chat is one continuous thread with a system divider:', pathB1Html.includes('Routed to Priya, Tier-2 support'));
console.log('Path B2 chat is one continuous thread with a system divider:', pathB2Html.includes('Routed to Priya, Tier-2 support'));

console.log('\n--- automated chat intro spot-check ---');
console.log('Path A opens with the automated greeting:', pathAHtml.includes('Thank you for reaching out to GoodCo Support'));
console.log('Path A shows the quick-reply option menu with Other last:', pathAHtml.includes('Reset my password') && pathAHtml.includes('Something else with my account') && pathAHtml.includes('>Other<'));
console.log('Path A shows the customer\'s quick-reply selection as a pill:', pathAHtml.includes('I can&#x27;t log in'));
console.log('Path B1 also opens with the same automated greeting:', pathB1Html.includes('Thank you for reaching out to GoodCo Support'));
console.log('Path B2 also opens with the same automated greeting:', pathB2Html.includes('Thank you for reaching out to GoodCo Support'));

process.exit(failed ? 1 : 0);
