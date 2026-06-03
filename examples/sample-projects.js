/* ════════════════════════════════════════════════════════════════════════
   A MINIMAL EXAMPLE — copy this shape into src/projectData.js to start fresh.

   This is the smallest project that still tells the core story:
     - low-leverage setup work the agent does alone (valleys)
     - one high-leverage human decision (a summit)
     - a low-leverage tail as the agent wraps up

   Each event needs:
     type    "ai" | "gate" | "collab"
     time    an ISO-ish timestamp — drives the x-axis (real time)
     title   a short human-readable label
     scores  the four signals that produce leverage (see ../src/scoring.js)
   ════════════════════════════════════════════════════════════════════════ */

export const projects = [
  {
    id: "example",
    name: "My First Project",
    when: "Jun 1 – Jun 3, 2026",
    benchmark: { suite: "internal-evals v3", score: 90 },
    events: [
      // valley — agent sets things up on its own
      { type: "ai",   time: "2026-06-01T09:00", title: "Agent scaffolds the work",       scores: { costOfError: 20, blastRadius: 18, reversibility: 92, confidence: 90 } },
      { type: "ai",   time: "2026-06-01T15:00", title: "Agent drafts the first version", scores: { costOfError: 34, blastRadius: 30, reversibility: 82, confidence: 84 } },

      // summit — the human makes the call that's expensive to get wrong
      { type: "gate", time: "2026-06-02T11:00", title: "Human approves the direction",   scores: { costOfError: 86, blastRadius: 80, reversibility: 22, confidence: 56 } },

      // tail — agent finishes up, low stakes again
      { type: "ai",   time: "2026-06-03T14:00", title: "Agent ships and reports",        scores: { costOfError: 24, blastRadius: 22, reversibility: 86, confidence: 88 } },
    ],
  },
];
