# GoodCo Optimize POC: support ticket intelligence

An interactive walkthrough of the prioritized recommendation: auto-categorize inbound tickets at intake (Stage 1), then auto-draft Tier-1 replies using that same classification (Stage 2). Built to make the new workflow tangible for Marcus and Sarah, not to showcase the agent architecture behind it.

## What this is

- Stage 1 shows a real ticket ("Can't log in, SSO keeps failing") going from unsorted to categorized, tagged, and routed, with a confidence score, in the same visual language Scribe's own Optimize product already uses (dark slate surfaces, indigo accent, Public Sans).
- Stage 2 shows the classification from Stage 1 flowing into a second agent that looks up the account and drafts a reply, landing in a human review queue rather than auto-sending, matching the "no auto-send in v1" design called for in the Optimize recommendation.
- The right rail ("Memory") is the part worth pointing at directly if anyone asks how context moves between the two agents: the ticket's classification appears there as a chip the moment Stage 1 finishes, and Stage 2 visibly reuses it rather than re-deriving it from scratch.
- No backend, no real model calls. Everything is scripted content in `src/data/pipeline.ts`, the same approach the reference build it's adapted from uses, so it's safe to demo live with zero setup risk.

## What was deliberately left out

The starting reference project was a five-journey, multi-agent platform demo. This POC keeps only the pieces relevant to a single two-stage flow: the context rail, the chip hand-off pattern, and the window-chrome presentation frame. The multi-journey hub, playback-speed tuning, CxO view toggle, and the five-artifact-kind system were all removed. If the room asks about agent architecture specifics or the build-vs-buy decision, that's intentionally a separate conversation, not in this file.

## Run it locally

```bash
npm install
npm run dev
```

Opens at the port Vite prints (defaults to 5175). `npm run build` produces a static production build in `dist/` if you want to host it somewhere for the actual session instead of running it from a terminal.

## Editing the content

Everything partner-facing lives in `src/data/pipeline.ts`: the ticket text, the agent bullets, the eval lines, the drafted reply, and the two stages' hero stats. Change the numbers or the copy there; no component code needs to change to update what's said.
