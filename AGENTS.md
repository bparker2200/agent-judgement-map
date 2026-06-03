# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, Cursor, etc.) working in this repo.

## What this project is

Agent Judgement Map is a small React template that visualizes **where human judgement belongs in an agentic workflow**. It is a *concept first* and a chart second. The concept is stronger than the UI — keep every change pointing back to it.

**The thesis, in one line:** _Autonomy in the valleys. Humans at the summits._

Read [DESIGN.md](DESIGN.md) before non-trivial changes — it records what's principled vs. demo-grade, the known failure modes, and the roadmap. Don't "fix" something that's deliberately illustrative without checking there first.

**The core model — do not change this:**

- x-axis = **time** (real time, the work unfolding)
- y-axis = **leverage** (consequence / how much human judgement a moment needs)
- peaks = moments for human review / approval / judgement
- valleys = moments where the agent can move autonomously

## Project structure

```
src/
  main.jsx           entry point — rarely needs changes
  App.jsx            loads the data and renders <ProjectShape />
  ProjectShape.jsx   the main visual component (SVG chart + animation)
  projectData.js     the editable project/event data
  scoring.js         the leverage calculation (eval → leverage)
  styles.css         page-level styling + keyframes
examples/
  sample-projects.js a minimal copy-paste data example
```

## Where things live

- **Editable content:** `src/projectData.js` — project names, dates, and events.
- **Scoring logic:** `src/scoring.js` — `WEIGHTS` and `deriveLeverage()`.
- **Visual component:** `src/ProjectShape.jsx` — the `C` color palette is near the top.
- **Styling:** `src/styles.css`.

## Safe to edit

- Sample data in `src/projectData.js` and `examples/sample-projects.js`.
- Scoring weights in `src/scoring.js` (if the user asks to retune leverage).
- Colors in the `C` palette and values in `src/styles.css`.
- Copy/labels and README prose.

## Do not change casually

- The central model: **x = time, y = leverage.** Don't relabel the axes to mean something else.
- The thesis: **autonomy in the valleys, humans at the summits.**
- The data shape (`type` / `time` / `title` / `scores`) — other files depend on it. If you change it, update `ProjectShape.jsx`, `scoring.js`, the README, and `examples/` together.
- The visual language (dark cinematic look, glowing line, human/agent/project glyphs) — don't redesign it unless explicitly asked.

## Rules of thumb

- Keep editable content in `projectData.js`.
- Keep scoring logic in `scoring.js`.
- Keep the visual component readable and lightly commented.
- Do not over-engineer the repo.
- Do not introduce unnecessary dependencies (current deps: `react`, `react-dom`, `lucide-react`).
- Prioritize clarity for non-expert users.
- Before finishing major edits, make sure **`npm run build` passes.**

## Commands

```bash
npm install      # install dependencies
npm run dev      # local dev server
npm run build    # production build — must pass before you're done
```
