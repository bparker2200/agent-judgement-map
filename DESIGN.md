# Design notes

The reasoning behind Agent Judgement Map — what's principled, what's demo-grade, and what's known to be wrong or missing. If you're going to fork, extend, or cite this, read this first. The honest version of a concept ships better than the polished version of a lie.

## The thesis

> **Autonomy in the valleys. Humans at the summits.**

The strongest idea here is the **encoding**. If height = leverage and x = time, the shape itself tells a story: the line climbs toward the moments that matter most, and those peaks are exactly where a human should be gated in. The visual makes the thesis legible at a glance — not constant oversight, but *well-placed intervention.*

Everything below is in service of keeping that encoding honest.

## What this tool is (and isn't), today

It is **retrospective**: it plots a finished project as a told story and shows where human judgement actually mattered. Think of it as an **audit** of a collaboration, not a forecast.

The pitch sometimes sounds prospective ("decide where humans *should* intervene"). You *can* score events before they happen — but then the scores stop being measurements of this instance and become **priors from the task class** ("tasks like this have historically been where humans add value"). What you can never know in advance is the realized outcome. The honest prospective version isn't a prediction; it's a **predicted-vs-realized overlay**, where the gap between the forecast curve and what actually happened is the insight. That's a roadmap item (see below), not what ships today.

## The scoring model

Leverage is derived from four signals per event (`src/scoring.js`):

| signal | 0–100 | direction |
|---|---|---|
| `costOfError` | how expensive it is to be wrong | higher → more leverage |
| `blastRadius` | how widely a wrong call propagates | higher → more leverage |
| `reversibility` | how easily it's undone | higher → **less** leverage |
| `confidence` | the agent's confidence | higher → **less** leverage |

### The category error to avoid

It's tempting to say "derive all four from an eval." **That's a conflation of two different things.** An eval tells you how often the model is wrong — `P(error)`. But `costOfError`, `blastRadius`, and `reversibility` are facts about the **deployment context**, not about model performance. No eval run can tell you that shipping the wrong pricing rule costs $2M — that's a business fact.

The pipeline that actually holds up is **two-source**:

- **`confidence` ← the eval.** This is the one signal that genuinely comes from there — ideally a calibrated confidence or pass-rate on the *task class*, **not** the agent's in-the-moment self-report (see Failure modes).
- **`cost / blast / reversibility` ← a context layer.** A risk taxonomy that's either human-authored per task type or estimated by a classifier reading the task description. The eval can *nudge* cost (frequent failures raise expected loss) but doesn't set its magnitude.

### The weights are illustrative, not validated

The current weights (`cost 0.32, blast 0.28, rev 0.25, conf 0.15`) were tuned until the demo curve told a clean story — gates peak, autonomous stretches dip. **Do not cite `0.32` as if it means something.** If you fork this, the magnitudes are yours to set.

What *is* worth preserving isn't the numbers — it's two structural commitments:

1. **Reversibility and confidence are inverted** (more reversible, more confident → *less* need for a human).
2. **Leverage should be expected-loss-shaped, not a flat sum.** The real quantity is closer to `P(error) × impact` — expected regret. The current additive blend can't express that: it lets a confident agent on a catastrophic task average out to "medium." Moving the blend from additive to **multiplicative** is the most important scoring improvement on the roadmap.

### Dimensions left out that probably belong in

- **Detectability** — can you even tell when it went wrong? Undetectable errors are far more dangerous than loud ones. (This is the one most worth adding; it interacts with the failure modes below.)
- Novelty / precedent
- Regulatory exposure
- Time pressure
- Stakeholder count

## Failure modes — yes, the encoding can lie

The encoding's strength (height = leverage, readable at a glance) is also its danger: a smooth, confident line *looks* trustworthy. It is blindest exactly where it's most dangerous.

- **Self-reported confidence flattens its own peaks.** An overconfident agent reports high confidence → the `(100 − confidence)` term shrinks → leverage drops → the peak flattens → no human is prompted → which is precisely the moment a human was needed. Always use calibrated or external confidence, never raw self-report.
- **Unlogged moments are invisible, not low.** The chart only plots events someone marked as decisions. The most dangerous step is often the one nobody flagged — and a non-event is an *invisible* point, not a low one.
- **Slow-burn risk can't be seen.** A run of individually-trivial steps that compound. Each point sits low; the aggregate is catastrophic. Height-per-event can't see accumulation.

**Guards worth building in:** calibrated/external confidence only; render uncertainty as a *band* so a poorly-calibrated "smooth confident line" looks thin and shaky rather than crisp; add an observability channel so a long flat plain reads as "unwatched," not "safe"; overlay realized incidents/rollbacks against predicted leverage so divergences expose the lies.

## The x-axis: real time vs sequence

The default is **real time**, and it's a deliberate tradeoff:

- **Real time is a feature** for operational / attention reading — long autonomous plains become visible as *unwatched stretches*, which serves the observability point above.
- **The cost:** three rapid decisions compress into an unreadable spike, and one lonely point in a week-long gap dominates the canvas while saying little.
- **Sequence / even-step** would give every decision equal visual weight — better for teaching the *structure* of deliberation to newcomers.

The distortion is a feature for one reading and a bug for the other. The right long-term answer is a **toggle**; real time is the shipped default because it best dramatizes "autonomy in the valleys." Sequence is on the roadmap.

## Concepts not yet on the screen (roadmap)

Ideas that belong in the visual language if this is going to teach the concept to strangers:

- **The cost of arrival.** "The human arrives" is drawn, but arrival takes *time* — a gate blocks while you wait for the human. The line should stall (a flat waiting segment) before resolving. That latency is a real, often dominant cost of human-gating, and right now it's invisible.
- **Handoff direction.** Did the agent *escalate* (asked for help) or did the human *interrupt* (barged in because the agent didn't flag it)? Escalation is healthy; interruption is a near-miss. Same glyph today, very different meaning.
- **Trust over time.** As a relationship matures, gates should *thin out* — the human supervises less because trust is earned. A meta-curve of supervision density across projects would show this; the collaboration selector gestures at it but doesn't plot the trend.
- **Upside vs downside leverage.** A human at a peak might be preventing a disaster *or* capturing an opportunity. One height collapses "high stakes if wrong" and "high value if right" into the same mark. Different reasons to show up.
- **Agent health on the line.** The line is the same confident cyan whether the agent is cruising or flailing. It could fray or desaturate when the eval says it's struggling — the visual fix for the confidence failure mode.

### Scoring / data roadmap

- Multiplicative (expected-loss) blend instead of additive sum.
- Two-source pipeline: eval-derived confidence + a context-layer risk taxonomy.
- Calibrated confidence and an uncertainty band.
- A `detectability` signal.
- Predicted-vs-realized overlay (the honest prospective mode).
- Sequence / real-time axis toggle.

---

The three caveats most worth a reader's attention before they trust a curve: **the weights are illustrative**, **self-reported confidence can hide the peak that matters**, and **the latency cost of a human gate isn't drawn yet.**
