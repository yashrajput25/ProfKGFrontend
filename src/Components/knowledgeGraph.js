import React, { useEffect, useMemo, useRef, useState } from "react";
import { Network } from "vis-network/standalone";
const API_BASE = process.env.REACT_APP_API_URL;

/**
 * Ultra‑Polished Knowledge Graph
 * Visual goals:
 *  - Elegant dark/light theme with soft glassy toolbar & legend chips
 *  - Clear hierarchy (student → course → lecture → video)
 *  - Progress-aware colors for courses/lectures
 *  - Crisp spacing + idempotent expand/collapse
 *  - Search highlight + keyboard shortcuts
 *  - Zoom-to-fit, PNG export, Physics toggle
 */

// ===== THEME ===== //
const THEMES = {
  dark: {
    name: "dark",
    bg: "#080D1A",
    panel: "rgba(13,22,41,0.72)", // glass
    text: "#E5EAF2",
    mutetext: "#9FB0C5",
    border: "#1E2A3A",
    edge: "#5C6B80",
    // semantic
    student: { bg: "#F97316", border: "#EA580C" },
    courseBase: { bg: "#0EA5E9", border: "#0284C7" },
    lectureBase: { bg: "#3B82F6", border: "#2563EB" },
    videoWatched: { bg: "#22C55E", border: "#16A34A" },
    videoUnwatched: { bg: "#F43F5E", border: "#E11D48" },
    highlight: { bg: "#EAB308", border: "#A16207", text: "#111827" },
  },
  light: {
    name: "light",
    bg: "#F7FAFF",
    panel: "rgba(255,255,255,0.8)",
    text: "#0F172A",
    mutetext: "#64748B",
    border: "#E2E8F0",
    edge: "#94A3B8",
    student: { bg: "#FB923C", border: "#EA580C" },
    courseBase: { bg: "#38BDF8", border: "#0EA5E9" },
    lectureBase: { bg: "#60A5FA", border: "#3B82F6" },
    videoWatched: { bg: "#34D399", border: "#10B981" },
    videoUnwatched: { bg: "#FB7185", border: "#F43F5E" },
    highlight: { bg: "#F59E0B", border: "#D97706", text: "#111827" },
  },
};

// Interpolate two hex colors (0..1)
function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255;
  const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255;
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return `#${(rr << 16 | rg << 8 | rb).toString(16).padStart(6, "0")}`;
}

const TOOLTIP_STYLE =
  "font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial; font-size: 13px; color: #0B1220;";

export default function KnowledgeGraph({ studentId }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  // Caches
  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  const lecturesMap = useRef({}); // courseId -> lectures[]
  const videosMap = useRef({}); // lectureId -> videos[]
  const courseProgress = useRef({}); // courseId -> { watched, total }
  const lectureProgress = useRef({}); // lectureId -> { watched, total }

  // Expanded state
  const expandedCourses = useRef(new Set());
  const expandedLectures = useRef(new Set());

  // UI state
  const [theme, setTheme] = useState("dark");
  const T = THEMES[theme];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [physics, setPhysics] = useState(false);

  const options = useMemo(
    () => ({
      autoResize: true,
      interaction: { hover: true, tooltipDelay: 120, zoomView: true, dragView: true },
      layout: {
        hierarchical: {
          enabled: true,
          direction: "UD",
          levelSeparation: 150,
          nodeSpacing: 220,
          treeSpacing: 260,
          blockShifting: true,
          edgeMinimization: true,
          parentCentralization: true,
        },
      },
      physics: physics,
      nodes: {
        font: { size: 15, face: "Inter", color: T.text },
        shadow: { enabled: true, color: "rgba(0,0,0,0.25)", size: 10, x: 0, y: 2 },
      },
      edges: {
        arrows: { to: false },
        color: { color: T.edge },
        smooth: { enabled: true, type: "dynamic" },
        width: 1.4,
        selectionWidth: 1.8,
      },
      groups: {
        student: {
          shape: "box",
          color: { background: T.student.bg, border: T.student.border },
          margin: 10,
          font: { size: 20, color: "#fff", bold: true },
          borderWidth: 3,
        },
        course: {
          shape: "box",
          color: { background: T.courseBase.bg, border: T.courseBase.border },
          margin: 8,
          font: { size: 16, color: "#fff" },
          borderWidth: 2,
        },
        lecture: {
          shape: "ellipse",
          color: { background: T.lectureBase.bg, border: T.lectureBase.border },
          font: { size: 14, color: "#F8FAFC" },
          borderWidth: 2,
        },
        video_watched: {
          shape: "dot",
          size: 18,
          color: { background: T.videoWatched.bg, border: T.videoWatched.border },
          font: { size: 13, color: "#F8FAFC" },
          borderWidth: 1,
        },
        video_unwatched: {
          shape: "dot",
          size: 18,
          color: { background: T.videoUnwatched.bg, border: T.videoUnwatched.border },
          font: { size: 13, color: "#F8FAFC" },
          borderWidth: 1,
        },
        highlight: {
          shape: "box",
          color: { background: T.highlight.bg, border: T.highlight.border },
          font: { size: 17, color: T.highlight.text },
          borderWidth: 3,
        },
      },
      configure: false,
    }),
    [physics, theme]
  );

  // Fetch + init
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/api/knowledgeGraph/${studentId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;

        // Compute progress for courses/lectures
        const courseAgg = {};
        const nodes = [];
        const edges = [];

        nodes.push({
          id: "student",
          label: `🎓 ${data.fullName || "Student"}`,
          group: "student",
          level: 0,
          title: `<div style=\"${TOOLTIP_STYLE}\"><b>Student</b><br/>${esc(
            data.fullName || "Student"
          )}</div>`,
        });

        (data.ongoingCourses || []).forEach((course) => {
          const courseId = `course-${course._id}`;

          // Precompute lecture/video progress
          const lectures = course.lectures || [];
          lecturesMap.current[courseId] = lectures;
          let watched = 0, total = 0;

          lectures.forEach((lec) => {
            const vids = lec.videos || [];
            videosMap.current[`lecture-${courseId}-${lec.lectureNumber}`] = vids;
            vids.forEach((v) => { total += 1; if (v.watched) watched += 1; });
          });

          courseAgg[courseId] = { watched, total };
          courseProgress.current[courseId] = { watched, total };

          const pct = total ? Math.round((watched / total) * 100) : 0;
          const bg = mix(T.courseBase.bg, T.videoWatched.bg, (watched / Math.max(1,total)) * 0.6);

          nodes.push({
            id: courseId,
            label: `📘 ${course.title}\n${pct}% complete`,
            group: "course",
            level: 1,
            color: { background: bg, border: T.courseBase.border },
            title: `<div style=\"${TOOLTIP_STYLE}\"><b>Course</b><br/>${esc(course.title)}<br/>Progress: ${pct}%</div>`,
          });
          edges.push({ from: "student", to: courseId });
        });

        nodesRef.current = nodes;
        edgesRef.current = edges;

        networkRef.current = new Network(containerRef.current, { nodes, edges }, options);

        networkRef.current.on("click", onSingleClick);
        networkRef.current.on("doubleClick", onDoubleClick);

        // Keyboard shortcuts
        const keyHandler = (e) => {
          if (e.key.toLowerCase() === "f") onZoomToFit();
          if (e.key.toLowerCase() === "e") onExpandAll();
          if (e.key.toLowerCase() === "c") onCollapseAll();
          if (e.key.toLowerCase() === "p") setPhysics((p) => !p);
          if (e.key.toLowerCase() === "t") setTheme((th) => (th === "dark" ? "light" : "dark"));
        };
        window.addEventListener("keydown", keyHandler);

        // Resize observe
        const ro = new ResizeObserver(() => networkRef.current?.redraw());
        ro.observe(containerRef.current);

        setLoading(false);

        return () => {
          window.removeEventListener("keydown", keyHandler);
          ro.disconnect();
        };
      })
      .catch((e) => {
        if (!mounted) return;
        setError(String(e.message || e));
        setLoading(false);
      });

    return () => {
      mounted = false;
      networkRef.current?.destroy();
      networkRef.current = null;
    };
  }, [studentId, options]);

  // Single-click expand/collapse
  const onSingleClick = (params) => {
    if (!params?.nodes?.length) return;
    const id = params.nodes[0];

    if (id.startsWith("course-")) {
      if (expandedCourses.current.has(id)) {
        collapseChildren(id, "lecture-");
        expandedCourses.current.delete(id);
      } else {
        expandLectures(id);
        expandedCourses.current.add(id);
      }
    } else if (id.startsWith("lecture-")) {
      if (expandedLectures.current.has(id)) {
        collapseChildren(id, "video-");
        expandedLectures.current.delete(id);
      } else {
        expandVideos(id);
        expandedLectures.current.add(id);
      }
    }
  };

  // Double-click focus
  const onDoubleClick = (params) => {
    if (!params?.nodes?.length) return;
    const id = params.nodes[0];
    try { networkRef.current.focus(id, { scale: 1, animation: true }); } catch {}
  };

  // Expand helpers with progress-aware colors for lectures
  const expandLectures = (courseId) => {
    const lectures = lecturesMap.current[courseId] || [];
    const newNodes = [];
    const newEdges = [];

    lectures.forEach((lecture) => {
      const lectureId = `lecture-${courseId}-${lecture.lectureNumber}`;
      if (!nodesRef.current.some((n) => n.id === lectureId)) {
        const vids = videosMap.current[lectureId] || lecture.videos || [];
        const total = vids.length || 0;
        const watched = vids.filter((v) => v.watched).length;
        lectureProgress.current[lectureId] = { watched, total };
        const pct = total ? Math.round((watched / total) * 100) : 0;
        const bg = mix(T.lectureBase.bg, T.videoWatched.bg, (watched / Math.max(1,total)) * 0.6);

        newNodes.push({
          id: lectureId,
          label: `📚 Lecture ${lecture.lectureNumber}\n${pct}% complete`,
          group: "lecture",
          level: 2,
          color: { background: bg, border: T.lectureBase.border },
          title: `<div style=\"${TOOLTIP_STYLE}\"><b>Lecture</b> #${lecture.lectureNumber}<br/>Progress: ${pct}%</div>`,
        });
        newEdges.push({ from: courseId, to: lectureId });
      }
    });

    if (newNodes.length) addToGraph(newNodes, newEdges, true);
  };

  const expandVideos = (lectureId) => {
    const videos = videosMap.current[lectureId] || [];
    const newNodes = [];
    const newEdges = [];

    videos.forEach((video, idx) => {
      const videoId = `video-${lectureId}-${idx}`;
      if (!nodesRef.current.some((n) => n.id === videoId)) {
        const watched = !!video.watched;
        newNodes.push({
          id: videoId,
          label: `${watched ? "▶" : "⏺"} ${truncate(video.title, 36)}`,
          group: watched ? "video_watched" : "video_unwatched",
          level: 3,
          title: `<div style=\"${TOOLTIP_STYLE}\"><b>Video</b><br/>${esc(video.title)}<br/><i>${watched ? "Watched" : "Not watched"}</i></div>`,
        });
        newEdges.push({ from: lectureId, to: videoId });
      }
    });

    if (newNodes.length) addToGraph(newNodes, newEdges, false);
  };

  const addToGraph = (newNodes, newEdges, fit = false) => {
    nodesRef.current = [...nodesRef.current, ...newNodes];
    edgesRef.current = [...edgesRef.current, ...newEdges];
    networkRef.current.setData({ nodes: nodesRef.current, edges: edgesRef.current });
    if (fit) onZoomToFit(300);
  };

  // Collapse children recursively
  const collapseChildren = (parentId, childPrefix) => {
    const direct = edgesRef.current
      .filter((e) => e.from === parentId && String(e.to).startsWith(childPrefix))
      .map((e) => e.to);
    if (!direct.length) return;

    const toRemove = new Set(direct);
    const stack = [...direct];
    while (stack.length) {
      const cur = stack.pop();
      const gkids = edgesRef.current.filter((e) => e.from === cur).map((e) => e.to);
      gkids.forEach((g) => { if (!toRemove.has(g)) { toRemove.add(g); stack.push(g); } });
    }

    nodesRef.current = nodesRef.current.filter((n) => !toRemove.has(n.id));
    edgesRef.current = edgesRef.current.filter((e) => !toRemove.has(e.to) && !toRemove.has(e.from));
    networkRef.current.setData({ nodes: nodesRef.current, edges: edgesRef.current });
  };

  // Controls
  const onZoomToFit = (duration = 420) => {
    try { networkRef.current?.fit({ animation: { duration, easingFunction: "easeInOutQuad" } }); } catch {}
  };

  const onExpandAll = () => {
    const courseIds = nodesRef.current.filter((n) => n.id.startsWith("course-")).map((n) => n.id);
    courseIds.forEach((cid) => { if (!expandedCourses.current.has(cid)) { expandLectures(cid); expandedCourses.current.add(cid); } });

    const lectureIds = nodesRef.current.filter((n) => n.id.startsWith("lecture-")).map((n) => n.id);
    lectureIds.forEach((lid) => { if (!expandedLectures.current.has(lid)) { expandVideos(lid); expandedLectures.current.add(lid); } });

    onZoomToFit();
  };

  const onCollapseAll = () => {
    const keepIds = new Set(["student", ...nodesRef.current.filter((n) => n.id.startsWith("course-")).map((n) => n.id)]);
    nodesRef.current = nodesRef.current.filter((n) => keepIds.has(n.id));
    edgesRef.current = edgesRef.current.filter((e) => keepIds.has(e.from) && keepIds.has(e.to));
    expandedCourses.current.clear();
    expandedLectures.current.clear();
    networkRef.current.setData({ nodes: nodesRef.current, edges: edgesRef.current });
    onZoomToFit();
  };

  const onExportPNG = () => {
    try {
      const canvas = networkRef.current?.canvas?.frame?.canvas;
      if (!canvas) return;
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `knowledge-graph-${Date.now()}.png`;
      link.click();
    } catch (e) { console.warn("Export failed", e); }
  };

  // Debounced search highlight
  useEffect(() => {
    const id = setTimeout(() => applySearch(query), 160);
    return () => clearTimeout(id);
  }, [query]);

  const applySearch = (q) => {
    if (!networkRef.current) return;
    const needle = q.trim().toLowerCase();

    // Reset groups
    const reset = nodesRef.current.map((n) => (n._origGroup ? { ...n, group: n._origGroup, _origGroup: undefined } : n));

    let first = null;
    if (needle) {
      reset.forEach((n) => {
        const label = String(n.label || "").toLowerCase();
        if (label.includes(needle)) {
          if (!n._origGroup) n._origGroup = n.group;
          n.group = "highlight";
          if (!first) first = n.id;
        }
      });
    }

    nodesRef.current = reset;
    networkRef.current.setData({ nodes: nodesRef.current, edges: edgesRef.current });
    if (first) try { networkRef.current.focus(first, { scale: 1.08, animation: true }); } catch {}
  };

  // ===== RENDER ===== //
  return (
    <div style={{ width: "100%", height: "100%", background: T.bg, color: T.text }}>
      {/* Toolbar */}
      <div style={toolbarStyle(T)}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 700, letterSpacing: 0.2 }}>🎓 Knowledge Graph</span>
          <kbd style={kbdStyle(T)}>F</kbd>
          <span style={{ fontSize: 12, color: T.mutetext }}>fit</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search course / lecture / video"
            style={searchStyle(T)}
          />
          <ToolbarButton onClick={() => setTheme((th) => (th === "dark" ? "light" : "dark"))} label={theme === "dark" ? "Light" : "Dark"} T={T} />
          <ToolbarButton onClick={() => setPhysics((p) => !p)} label={physics ? "Physics On" : "Physics Off"} T={T} />
          <ToolbarButton onClick={onZoomToFit} label="Fit" T={T} />
          <ToolbarButton onClick={onExpandAll} label="Expand All" T={T} />
          <ToolbarButton onClick={onCollapseAll} label="Collapse All" T={T} />
          <ToolbarButton onClick={onExportPNG} label="Export PNG" T={T} />
        </div>
      </div>

      {/* Legend */}
      <Legend T={T} />

      {/* Graph container with subtle gradient border */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "calc(100vh - 150px)",
          background: T.bg,
          borderTop: `1px solid ${T.border}`,
        }}
      />

      {loading && <div style={{ padding: 16, fontSize: 14, color: T.mutetext }}>Loading…</div>}
      {error && <div style={{ padding: 16, fontSize: 14, color: THEMES.dark.videoUnwatched.bg }}>Error: {error}</div>}
    </div>
  );
}

// ===== UI Bits ===== //
function ToolbarButton({ label, onClick, T }) {
  return (
    <button onClick={onClick} style={buttonStyle(T)}>{label}</button>
  );
}

function Legend({ T }) {
  const Chip = ({ color, label }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 999, background: T.panel, border: `1px solid ${T.border}`, boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: color, border: `1px solid ${T.border}`, display: "inline-block" }} />
      <span style={{ fontSize: 12, color: T.mutetext }}>{label}</span>
    </div>
  );

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 14px", backdropFilter: "saturate(1.1) blur(6px)", background: T.panel, borderBottom: `1px dashed ${T.border}` }}>
      <Chip color={T.student.bg} label="Student" />
      <Chip color={T.courseBase.bg} label="Course (progress tint)" />
      <Chip color={T.lectureBase.bg} label="Lecture (progress tint)" />
      <Chip color={T.videoWatched.bg} label="Video – Watched" />
      <Chip color={T.videoUnwatched.bg} label="Video – Not watched" />
      <div style={{ marginLeft: "auto", fontSize: 12, color: T.mutetext }}>Shortcuts: <kbd style={kbdStyle(T)}>F</kbd> fit · <kbd style={kbdStyle(T)}>E</kbd> expand · <kbd style={kbdStyle(T)}>C</kbd> collapse · <kbd style={kbdStyle(T)}>P</kbd> physics · <kbd style={kbdStyle(T)}>T</kbd> theme</div>
    </div>
  );
}

// ===== Styles ===== //
function toolbarStyle(T) {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    borderBottom: `1px solid ${T.border}`,
    background: T.panel,
    backdropFilter: "saturate(1.1) blur(8px)",
    position: "sticky",
    top: 0,
    zIndex: 5,
  };
}

function buttonStyle(T) {
  return {
    padding: "8px 12px",
    background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
    color: T.text,
    border: `1px solid ${T.border}`,
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 13,
    boxShadow: "0 6px 22px rgba(0,0,0,0.12)",
  };
}

function searchStyle(T) {
  return {
    width: 320,
    maxWidth: "42vw",
    padding: "9px 12px",
    background: THEMES.dark.name === T.name ? "#0B1220" : "#FFFFFF",
    color: T.text,
    border: `1px solid ${T.border}`,
    borderRadius: 10,
    outline: "none",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
  };
}

function kbdStyle(T) {
  return {
    display: "inline-block",
    padding: "1px 6px",
    border: `1px solid ${T.border}`,
    borderRadius: 6,
    background: T.panel,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    fontSize: 11,
    color: T.mutetext,
  };
}

// ===== Utilities ===== //
function esc(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function truncate(str, n) {
  const s = String(str);
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
