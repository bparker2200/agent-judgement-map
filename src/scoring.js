/* ════════════════════════════════════════════════════════════════════════
   LEVERAGE IS DERIVED, NOT DECLARED.

   This is the scoring brain of the project. Every event on the chart gets a
   single "leverage" number (0–100) that says how much a human should care
   about that moment. High leverage → put a human at the summit. Low leverage
   → let the agent run through the valley.

   Leverage is expected-loss-shaped:  how bad it is if wrong  ×  how likely
   it is to be wrong.  It is blended from five signals you provide per event:

     costOfError   (0–100) how expensive it is to be wrong
     blastRadius   (0–100) how widely a wrong call propagates
     reversibility (0–100) how easily it's undone        (high → LOWERS leverage)
     detectability (0–100) how quickly you'd notice      (high → LOWERS leverage)
     confidence    (0–100) the agent's calibrated confidence (high → LOWERS leverage)

   Two things to tune:

   SEVERITY_WEIGHTS — how much each of the four context signals counts toward
   "how bad if wrong". They are exponents in a weighted geometric mean, so the
   signals compound rather than average: a moment that is fully reversible or
   instantly detectable is pulled down hard no matter how costly it is, and a
   single catastrophic signal can't be averaged away by three benign ones.
   (The weights must sum to 1 for the result to stay on the 0–100 scale.)

   CONFIDENCE_TRUST — how much of the agent's confidence you're willing to
   bank. 1.0 = trust it completely (pure expected loss: a 90%-confident agent
   cuts leverage by 90%). 0 = ignore confidence entirely. The default of 0.5
   means confidence can discount leverage by at most half — a deliberate
   guard, because self-reported confidence is the one signal that lies most
   where it matters most (see DESIGN.md → Failure modes). Raise it only when
   confidence comes from a calibrated eval, not from the agent's own report.

   NOTE: these numbers are ILLUSTRATIVE, not validated — they were tuned so the
   sample data tells a clean story. Don't read meaning into the exact values.
   Also note: cost/blast/reversibility/detectability are facts about your
   *deployment context*, not outputs of a model eval — only `confidence`
   really comes from an eval. See DESIGN.md for the full reasoning.
   ════════════════════════════════════════════════════════════════════════ */

export const SEVERITY_WEIGHTS = { cost: 0.35, blast: 0.25, rev: 0.25, detect: 0.15 };
export const CONFIDENCE_TRUST = 0.5;

// Clamp a 0–100 signal into (0, 1]. The floor keeps a signal at 0 from
// zeroing the whole product — "nothing at all is at stake" is never quite true.
const unit = (v) => Math.max(0.01, Math.min(100, v)) / 100;

// "How bad is it if this goes wrong?" — 0–1, a weighted geometric mean.
export function deriveSeverity(scores) {
  const w = SEVERITY_WEIGHTS;
  return (
    unit(scores.costOfError) ** w.cost *
    unit(scores.blastRadius) ** w.blast *
    unit(100 - scores.reversibility) ** w.rev *
    unit(100 - (scores.detectability ?? 50)) ** w.detect
  );
}

// "How much should confidence discount that?" — 0–1. At CONFIDENCE_TRUST = 0.5
// this runs from 1.0 (no confidence) down to 0.5 (total confidence).
export function deriveExposure(scores) {
  return 1 - CONFIDENCE_TRUST * unit(scores.confidence);
}

// Takes an event's `scores` object and returns its leverage (0–100).
export function deriveLeverage(scores) {
  const v = 100 * deriveSeverity(scores) * deriveExposure(scores);
  return Math.round(Math.max(0, Math.min(100, v)));
}
