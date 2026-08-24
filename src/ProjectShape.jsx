import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { projects as PROJECTS } from "./projectData.js";
import { deriveLeverage } from "./scoring.js";

/* ── palette ───────────────────────────────────────────────────────────────
   These colors are used directly as SVG fills/strokes below, so they live in
   JS rather than CSS. Tweak here to re-theme the chart. */
const C = {
  bg: "#0b0f14", panel: "#0f151c", ink: "#e9e4d8",
  faint: "#1c2630", grid: "#14202b",
  ai: "#48cfc0", aiSoft: "#48cfc033",
  human: "#f0a35e", humanSoft: "#f0a35e22",
  collab: "#c9a8ff", muted: "#5d6b78",
};
const SERIF = "'Fraunces', serif";
const MONO = "'IBM Plex Mono', monospace";

/* ── geometry ──────────────────────────────────────────────────────────── */
const W = 1000, H = 540;
const padL = 78, padR = 48, padT = 30, padB = 70;
const plotW = W - padL - padR;
const plotH = H - padT - padB;
const baselineY = padT + plotH;
const yOf = (lev) => padT + (1 - lev / 100) * plotH;

function buildSpline(pts) {
  if (pts.length < 2) return "";
  const d = [`M ${pts[0].x} ${pts[0].y}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    d.push(`C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`);
  }
  return d.join(" ");
}
const fmtDay = (ms) => new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric" });
const fmtFull = (ms) => new Date(ms).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

/* ── glyphs ────────────────────────────────────────────────────────────── */
function AIGlyph({ x = 0, y = 0, r = 11, active = true }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={active ? 1 : 0.35}>
      {[0, 90, 180, 270].map((a) => (
        <line key={a} x1={0} y1={0} x2={Math.cos((a * Math.PI) / 180) * (r + 6)}
          y2={Math.sin((a * Math.PI) / 180) * (r + 6)} stroke={C.ai} strokeWidth={1.4} opacity={0.55} />
      ))}
      <rect x={-r * 0.72} y={-r * 0.72} width={r * 1.44} height={r * 1.44}
        transform="rotate(45)" fill={C.bg} stroke={C.ai} strokeWidth={1.8} />
      <circle r={r * 0.32} fill={C.ai} />
    </g>
  );
}
function HumanGlyph({ x = 0, y = 0, r = 11 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r + 7} fill={C.humanSoft} />
      <circle r={r} fill={C.bg} stroke={C.human} strokeWidth={1.8} />
      <circle cy={-r * 0.28} r={r * 0.34} fill={C.human} />
      <path d={`M ${-r * 0.5} ${r * 0.55} Q 0 ${r * 0.05} ${r * 0.5} ${r * 0.55}`}
        fill="none" stroke={C.human} strokeWidth={1.7} strokeLinecap="round" />
    </g>
  );
}
function ProjectGlyph({ x = 0, y = 0, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -13 6 L -7 -2 L -1 3 L 5 -8 L 13 6 Z"
        fill={C.aiSoft} stroke={C.ink} strokeWidth={1.5} strokeLinejoin="round" />
    </g>
  );
}

function EvalBar({ label, value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontFamily: MONO, fontSize: 9.5, color: C.muted, width: 96, textAlign: "right", letterSpacing: 0.3 }}>{label}</span>
      <div style={{ flex: 1, height: 5, background: C.faint, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 9.5, color: C.ink, width: 22 }}>{value}</span>
    </div>
  );
}

const typeColor = (t) => (t === "gate" ? C.human : t === "collab" ? C.collab : C.ai);
const typeLabel = (t) => (t === "gate" ? "HUMAN GATE" : t === "collab" ? "COLLABORATION" : "AGENT AUTONOMOUS");

/* ════════════════════════════════════════════════════════════════════════
   THE MAIN VISUAL COMPONENT.
   Reads the selected project, turns each event's scores into a leverage
   value, lays out the spline over real time, and animates the agent line.
   ════════════════════════════════════════════════════════════════════════ */
export default function ProjectShape() {
  const [projectId, setProjectId] = useState(PROJECTS[0].id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  const project = useMemo(() => PROJECTS.find((p) => p.id === projectId), [projectId]);
  const n = project.events.length;

  const { nodes, splineD, areaD, ticks } = useMemo(() => {
    const withMs = project.events.map((e, i) => ({ ...e, i, ms: new Date(e.time).getTime(), leverage: deriveLeverage(e.scores) }));
    const times = withMs.map((e) => e.ms);
    const minMs = Math.min(...times), maxMs = Math.max(...times);
    const span = maxMs - minMs || 1;
    const xOf = (ms) => padL + ((ms - minMs) / span) * plotW;
    const nds = withMs.map((e) => ({ ...e, x: xOf(e.ms), y: yOf(e.leverage) }));
    const sp = buildSpline(nds);
    const ar = `${sp} L ${nds[nds.length - 1].x} ${baselineY} L ${nds[0].x} ${baselineY} Z`;
    const tk = Array.from({ length: 5 }, (_, k) => {
      const ms = minMs + (k / 4) * span;
      return { x: xOf(ms), label: fmtDay(ms) };
    });
    return { nodes: nds, splineD: sp, areaD: ar, ticks: tk };
  }, [project]);

  const pathRef = useRef(null);
  const rafRef = useRef(null);
  const [len, setLen] = useState(0);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);

  const startPlay = useCallback((L) => {
    cancelAnimationFrame(rafRef.current);
    setProgress(0);
    setPlaying(true);
    const start = performance.now();
    const DUR = 3600;
    const tick = (now) => {
      const t = Math.min((now - start) / DUR, 1);
      setProgress(t);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // measure path + autoplay whenever the project (and thus the curve) changes
  useEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    const L = p.getTotalLength();
    setLen(L);
    nodes.forEach((node) => {
      let lo = 0, hi = 1;
      for (let k = 0; k < 22; k++) {
        const mid = (lo + hi) / 2;
        if (p.getPointAtLength(mid * L).x < node.x) lo = mid; else hi = mid;
      }
      node.lenFrac = (lo + hi) / 2;
    });
    setHovered(null);
    setSelected(null);
    startPlay(L);
  }, [splineD, nodes, startPlay]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const animPoint = useMemo(() => {
    const p = pathRef.current;
    if (!p || !len) return null;
    return p.getPointAtLength(Math.min(progress, 1) * len);
  }, [progress, len]);

  const focus = hovered ?? selected;
  const focusNode = focus != null ? nodes[focus] : null;
  const offset = len ? len * (1 - progress) : 0;
  const recent = PROJECTS.slice(0, 5);

  return (
    <div style={{ background: C.bg, padding: "22px 26px 28px", borderRadius: 18, color: C.ink,
      fontFamily: MONO, border: `1px solid ${C.faint}`, position: "relative", overflow: "visible" }}>

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", borderRadius: 18, overflow: "hidden",
        background: `radial-gradient(120% 90% at 78% -10%, ${C.ai}0d, transparent 55%), radial-gradient(90% 80% at 6% 110%, ${C.human}0d, transparent 50%)` }} />

      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, position: "relative", zIndex: 5 }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: 3, color: C.ai, marginBottom: 6 }}>HUMAN-GATED TRAJECTORY</div>
          <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 28, lineHeight: 1, color: C.ink }}>{project.name}</div>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 8 }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.muted }}>{project.when}</span>
            <span style={{ fontFamily: MONO, fontSize: 9.5, color: C.ai, border: `1px solid ${C.ai}44`, borderRadius: 5, padding: "3px 8px" }}>
              BENCH {project.benchmark.score} · {project.benchmark.suite}
            </span>
          </div>
        </div>

        {/* project selector (accordion) */}
        <div style={{ position: "relative" }}>
          <div onClick={() => setMenuOpen((o) => !o)} style={{ display: "flex", alignItems: "center", gap: 9,
            background: C.panel, border: `1px solid ${menuOpen ? C.ai + "66" : C.faint}`, borderRadius: 9,
            padding: "9px 13px", cursor: "pointer", minWidth: 210 }}>
            <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1.5, color: C.muted }}>COLLAB</span>
            <span style={{ fontFamily: SERIF, fontSize: 14, color: C.ink, flex: 1 }}>{project.name}</span>
            <ChevronDown size={15} color={C.muted} style={{ transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform .2s ease" }} />
          </div>

          {menuOpen && (
            <>
              <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 10 }} />
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 320, zIndex: 20,
                background: C.panel, border: `1px solid ${C.faint}`, borderRadius: 11, overflow: "hidden",
                boxShadow: "0 20px 50px -12px #000a", animation: "fadeIn .16s ease" }}>
                <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: C.muted, padding: "11px 14px 7px" }}>RECENT COLLABORATIONS</div>
                {recent.map((p) => {
                  const sel = p.id === projectId;
                  const gates = p.events.filter((e) => e.type !== "ai").length;
                  return (
                    <div key={p.id} className="ps-row" onClick={() => { setProjectId(p.id); setMenuOpen(false); }}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                        borderLeft: `2px solid ${sel ? C.ai : "transparent"}`, background: sel ? C.faint + "88" : "transparent" }}>
                      <svg width="30" height="30" viewBox="-15 -15 30 30" style={{ flexShrink: 0 }}><ProjectGlyph s={0.95} /></svg>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: SERIF, fontSize: 14, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                        <div style={{ fontFamily: MONO, fontSize: 9.5, color: C.muted, marginTop: 2 }}>{p.when} · {gates} human touchpoints</div>
                      </div>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: C.ai }}>{p.benchmark.score}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* plot */}
      <div style={{ position: "relative" }}>
        {/* tiny replay */}
        <div className="ps-icon" onClick={() => startPlay(len)} title="Replay"
          style={{ position: "absolute", top: 2, right: 2, zIndex: 4, width: 26, height: 26, borderRadius: 7,
            border: `1px solid ${C.faint}`, display: "flex", alignItems: "center", justifyContent: "center",
            color: C.muted, background: C.bg + "cc" }}>
          <RotateCcw size={13} />
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
          <defs>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.ai} stopOpacity="0.26" />
              <stop offset="100%" stopColor={C.ai} stopOpacity="0" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* y grid */}
          {[0, 25, 50, 75, 100].map((lv) => (
            <g key={lv}>
              <line x1={padL} y1={yOf(lv)} x2={W - padR} y2={yOf(lv)} stroke={C.grid} strokeWidth={1} />
              <text x={padL - 12} y={yOf(lv) + 3.5} textAnchor="end" fontFamily={MONO} fontSize="10" fill={C.muted}>{lv}</text>
            </g>
          ))}

          {/* x time ticks (REAL time) */}
          {ticks.map((tk, k) => (
            <g key={k}>
              <line x1={tk.x} y1={padT} x2={tk.x} y2={baselineY} stroke={C.grid} strokeWidth={1} opacity={0.5} />
              <text x={tk.x} y={baselineY + 20} textAnchor="middle" fontFamily={MONO} fontSize="10" fill={C.muted}>{tk.label}</text>
            </g>
          ))}
          <text x={W - padR} y={baselineY + 40} textAnchor="end" fontFamily={MONO} fontSize="10" letterSpacing="2" fill={C.muted}>REAL TIME →</text>
          <text transform={`translate(20 ${padT + plotH / 2}) rotate(-90)`} textAnchor="middle" fontFamily={MONO} fontSize="10" letterSpacing="2" fill={C.muted}>LEVERAGE ↑</text>

          {/* terrain */}
          <path d={areaD} fill="url(#area)" opacity={progress > 0.02 ? 1 : 0} />

          {/* the agent line */}
          <path ref={pathRef} d={splineD} fill="none" stroke={C.ai} strokeWidth={2.6} strokeLinecap="round"
            filter="url(#glow)" strokeDasharray={len || undefined} strokeDashoffset={offset} />

          {/* nodes + human arrivals */}
          {nodes.map((node) => {
            const live = progress >= (node.lenFrac ?? node.i / (n - 1)) - 0.001;
            const isFocus = focus === node.i;
            const col = typeColor(node.type);
            return (
              <g key={node.i} opacity={live ? 1 : 0.12} style={{ transition: "opacity .25s ease" }}>
                {node.type === "gate" && (
                  <line x1={node.x} y1={node.y} x2={node.x} y2={baselineY} stroke={C.human} strokeWidth={1} strokeDasharray="3 4" opacity={0.4} />
                )}
                {(node.type === "gate" || node.type === "collab") && (
                  <>
                    <line x1={node.x} y1={node.y} x2={node.x} y2={node.y - 44} stroke={col} strokeWidth={1.4} opacity={0.6} />
                    <g className={live && playing ? "gate-in" : ""}>
                      <HumanGlyph x={node.x} y={node.y - 56} r={isFocus ? 11 : 9} />
                    </g>
                  </>
                )}
                <circle className="ps-node" cx={node.x} cy={node.y} r={isFocus ? 8.5 : node.type === "ai" ? 4.5 : 6}
                  fill={node.type === "ai" ? C.bg : col} stroke={col} strokeWidth={2}
                  onMouseEnter={() => setHovered(node.i)} onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected((s) => (s === node.i ? null : node.i))} />
                {node.type === "collab" && <circle cx={node.x} cy={node.y} r={2} fill={C.ai} pointerEvents="none" />}
              </g>
            );
          })}

          {playing && animPoint && <AIGlyph x={animPoint.x} y={animPoint.y} r={9} />}

          {focusNode && (
            <text x={focusNode.x} y={focusNode.y - (focusNode.type === "ai" ? 16 : 80)} textAnchor="middle"
              fontFamily={MONO} fontSize="10" fill={typeColor(focusNode.type)} pointerEvents="none">◆ {focusNode.leverage}</text>
          )}
        </svg>
      </div>

      {/* detail panel — shows the eval that PRODUCED the leverage */}
      <div style={{ marginTop: 12, background: C.panel, border: `1px solid ${C.faint}`, borderRadius: 12, padding: "14px 18px", minHeight: 96 }}>
        {focusNode ? (
          <div className="gate-in" key={focusNode.i} style={{ display: "flex", gap: 22, alignItems: "stretch" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: 1.5, color: typeColor(focusNode.type),
                  border: `1px solid ${typeColor(focusNode.type)}55`, padding: "3px 8px", borderRadius: 5 }}>{typeLabel(focusNode.type)}</span>
                <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.muted }}>{fmtFull(focusNode.ms)}</span>
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 18, color: C.ink, lineHeight: 1.25 }}>{focusNode.title}</div>
            </div>
            <div style={{ width: 250, borderLeft: `1px solid ${C.faint}`, paddingLeft: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1.5, color: C.muted }}>EVAL → LEVERAGE</span>
                <span style={{ fontFamily: SERIF, fontSize: 22, color: typeColor(focusNode.type) }}>{focusNode.leverage}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <EvalBar label="cost of error" value={focusNode.scores.costOfError} color={C.human} />
                <EvalBar label="blast radius" value={focusNode.scores.blastRadius} color={C.human} />
                <EvalBar label="reversibility" value={focusNode.scores.reversibility} color={C.ai} />
                <EvalBar label="detectability" value={focusNode.scores.detectability ?? 50} color={C.ai} />
                <EvalBar label="confidence" value={focusNode.scores.confidence} color={C.ai} />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: C.muted, display: "flex", alignItems: "center", height: 68 }}>
            Hover a point to see the eval behind its leverage, or click to pin it. Switch collaborations from the selector above.
          </div>
        )}
      </div>

      {/* legend */}
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, borderTop: `1px solid ${C.faint}`, paddingTop: 14 }}>
        {[
          { g: <HumanGlyph r={10} />, t: "The Human", d: "Drops in at decisions — arrives, never resides" },
          { g: <AIGlyph r={9} />, t: "The Agent", d: "Is the line — always running, across real time" },
          { g: <ProjectGlyph s={1} />, t: "The Project", d: "The terrain — the silhouette of the work" },
        ].map((it, k) => (
          <div key={k} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <svg width="40" height="40" viewBox="-20 -20 40 40" style={{ flexShrink: 0 }}>{it.g}</svg>
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 15, color: C.ink, lineHeight: 1.1 }}>{it.t}</div>
              <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.muted, marginTop: 3 }}>{it.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
