/* ════════════════════════════════════════════════════════════════════════
   LEVERAGE IS DERIVED, NOT DECLARED.

   This is the scoring brain of the project. Every event on the chart gets a
   single "leverage" number (0–100) that says how much a human should care
   about that moment. High leverage → put a human at the summit. Low leverage
   → let the agent run through the valley.

   Leverage is blended from four signals you provide per event:
     costOfError   (0–100) how expensive it is to be wrong
     blastRadius   (0–100) how widely a wrong call propagates
     reversibility (0–100) how easily it's undone   (high → LOWERS leverage)
     confidence    (0–100) the agent's own confidence (high → LOWERS leverage)

   Tune the WEIGHTS below to change how much each signal matters.

   NOTE: these weights are ILLUSTRATIVE, not validated — they were tuned so the
   sample data tells a clean story. Don't read meaning into the exact numbers.
   Also note: cost/blast/reversibility are facts about your *deployment context*,
   not outputs of a model eval — only `confidence` really comes from an eval.
   See DESIGN.md for the full reasoning (and why this blend should arguably be
   multiplicative rather than additive).
   ════════════════════════════════════════════════════════════════════════ */

export const WEIGHTS = { cost: 0.32, blast: 0.28, rev: 0.25, conf: 0.15 };

// Takes an event's `scores` object and returns its leverage (0–100).
export function deriveLeverage(scores) {
  const v =
    WEIGHTS.cost * scores.costOfError +
    WEIGHTS.blast * scores.blastRadius +
    WEIGHTS.rev * (100 - scores.reversibility) +
    WEIGHTS.conf * (100 - scores.confidence);
  return Math.round(Math.max(0, Math.min(100, v)));
}
