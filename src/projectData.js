/* ════════════════════════════════════════════════════════════════════════
   THIS IS THE FILE YOU EDIT.

   Each project is a story told over time. Each event is one moment in that
   story, scored on four signals (see scoring.js). The chart turns those
   scores into a "leverage" line — the shape of where judgement lives.

   Event `type` controls how a moment is drawn:
     "ai"     → agent worked autonomously   (valley — let it run)
     "gate"   → a human decision / approval  (summit — humans arrive here)
     "collab" → human + agent worked together

   `time` must be an ISO-ish timestamp ("2026-05-20T09:00") — the x-axis is
   REAL time, so spacing reflects how the work actually unfolded.

   To make this your own: change a project's `name`, `when`, and `events`.
   Add or remove events freely. The leverage line redraws itself.
   ════════════════════════════════════════════════════════════════════════ */

export const projects = [
  {
    id: "pricing",
    name: "Realtime Pricing Engine",
    when: "May 20 – Jun 2, 2026",
    benchmark: { suite: "internal-evals v3", score: 88 },
    events: [
      { type: "ai",     time: "2026-05-20T09:00", title: "Agent scaffolds the service",             scores: { costOfError: 22, blastRadius: 18, reversibility: 92, confidence: 90 } },
      { type: "ai",     time: "2026-05-20T14:30", title: "Agent drafts the pricing model",           scores: { costOfError: 38, blastRadius: 34, reversibility: 80, confidence: 82 } },
      { type: "gate",   time: "2026-05-21T10:00", title: "Human picks the rounding & rate strategy", scores: { costOfError: 78, blastRadius: 70, reversibility: 30, confidence: 60 } },
      { type: "ai",     time: "2026-05-23T11:00", title: "Agent implements & backfills",             scores: { costOfError: 44, blastRadius: 36, reversibility: 70, confidence: 80 } },
      { type: "collab", time: "2026-05-23T16:00", title: "Pair on the surge-pricing edge cases",     scores: { costOfError: 72, blastRadius: 62, reversibility: 42, confidence: 66 } },
      { type: "ai",     time: "2026-05-26T09:30", title: "Agent writes tests & docs",                scores: { costOfError: 24, blastRadius: 20, reversibility: 88, confidence: 86 } },
      { type: "gate",   time: "2026-05-28T15:00", title: "Ship / no-ship to production",             scores: { costOfError: 95, blastRadius: 90, reversibility: 15, confidence: 55 } },
      { type: "collab", time: "2026-05-29T10:00", title: "Tune thresholds from live traffic",        scores: { costOfError: 64, blastRadius: 58, reversibility: 48, confidence: 70 } },
      { type: "ai",     time: "2026-06-02T17:00", title: "Agent monitors & reports",                 scores: { costOfError: 18, blastRadius: 16, reversibility: 94, confidence: 90 } },
    ],
  },
  {
    id: "auth",
    name: "Auth Refactor",
    when: "May 6 – May 15, 2026",
    benchmark: { suite: "internal-evals v3", score: 81 },
    events: [
      { type: "ai",     time: "2026-05-06T10:00", title: "Agent maps the existing auth surface",     scores: { costOfError: 30, blastRadius: 40, reversibility: 85, confidence: 84 } },
      { type: "gate",   time: "2026-05-07T09:00", title: "Human approves the threat model",          scores: { costOfError: 90, blastRadius: 88, reversibility: 20, confidence: 50 } },
      { type: "ai",     time: "2026-05-08T14:00", title: "Agent migrates session handling",          scores: { costOfError: 48, blastRadius: 55, reversibility: 60, confidence: 72 } },
      { type: "gate",   time: "2026-05-09T11:00", title: "Human reviews token-rotation policy",      scores: { costOfError: 88, blastRadius: 82, reversibility: 25, confidence: 58 } },
      { type: "collab", time: "2026-05-12T15:00", title: "Pair on the password-reset flow",          scores: { costOfError: 70, blastRadius: 66, reversibility: 45, confidence: 64 } },
      { type: "gate",   time: "2026-05-14T16:00", title: "Security sign-off before rollout",         scores: { costOfError: 96, blastRadius: 92, reversibility: 12, confidence: 52 } },
      { type: "ai",     time: "2026-05-15T10:00", title: "Agent rolls out behind a flag",            scores: { costOfError: 35, blastRadius: 30, reversibility: 78, confidence: 80 } },
    ],
  },
  {
    id: "docs",
    name: "Docs Site Migration",
    when: "Apr 28 – May 2, 2026",
    benchmark: { suite: "internal-evals v3", score: 93 },
    events: [
      { type: "ai",     time: "2026-04-28T09:00", title: "Agent crawls & inventories old docs",      scores: { costOfError: 18, blastRadius: 20, reversibility: 95, confidence: 92 } },
      { type: "ai",     time: "2026-04-28T13:00", title: "Agent ports content to new framework",     scores: { costOfError: 22, blastRadius: 24, reversibility: 90, confidence: 88 } },
      { type: "gate",   time: "2026-04-30T10:00", title: "Human approves new IA & navigation",       scores: { costOfError: 58, blastRadius: 50, reversibility: 55, confidence: 70 } },
      { type: "ai",     time: "2026-05-01T11:00", title: "Agent fixes links & redirects",            scores: { costOfError: 26, blastRadius: 30, reversibility: 85, confidence: 86 } },
      { type: "ai",     time: "2026-05-02T15:00", title: "Agent deploys the new site",               scores: { costOfError: 30, blastRadius: 28, reversibility: 80, confidence: 84 } },
    ],
  },
  {
    id: "pipeline",
    name: "Data Pipeline Cleanup",
    when: "Apr 14 – Apr 22, 2026",
    benchmark: { suite: "internal-evals v3", score: 76 },
    events: [
      { type: "ai",     time: "2026-04-14T09:00", title: "Agent profiles the dirty tables",          scores: { costOfError: 28, blastRadius: 32, reversibility: 88, confidence: 80 } },
      { type: "collab", time: "2026-04-16T10:00", title: "Decide which rows are salvageable",        scores: { costOfError: 66, blastRadius: 60, reversibility: 40, confidence: 60 } },
      { type: "ai",     time: "2026-04-18T14:00", title: "Agent rewrites the transforms",            scores: { costOfError: 40, blastRadius: 44, reversibility: 70, confidence: 76 } },
      { type: "gate",   time: "2026-04-20T11:00", title: "Human signs off on the backfill plan",     scores: { costOfError: 82, blastRadius: 76, reversibility: 28, confidence: 58 } },
      { type: "ai",     time: "2026-04-22T16:00", title: "Agent runs the backfill & verifies",       scores: { costOfError: 36, blastRadius: 34, reversibility: 64, confidence: 78 } },
    ],
  },
  {
    id: "copy",
    name: "Marketing Site Copy",
    when: "Apr 2 – Apr 9, 2026",
    benchmark: { suite: "internal-evals v3", score: 85 },
    events: [
      { type: "ai",     time: "2026-04-02T10:00", title: "Agent drafts all page copy",               scores: { costOfError: 24, blastRadius: 30, reversibility: 90, confidence: 78 } },
      { type: "collab", time: "2026-04-04T11:00", title: "Workshop the hero & positioning",          scores: { costOfError: 62, blastRadius: 64, reversibility: 50, confidence: 58 } },
      { type: "collab", time: "2026-04-07T14:00", title: "Refine voice & tone together",             scores: { costOfError: 54, blastRadius: 48, reversibility: 56, confidence: 64 } },
      { type: "ai",     time: "2026-04-09T15:00", title: "Agent finalizes & publishes",              scores: { costOfError: 26, blastRadius: 28, reversibility: 82, confidence: 82 } },
    ],
  },
];
