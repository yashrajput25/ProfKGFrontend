import React, { useEffect, useMemo, useRef, useState } from "react";
import { Network } from "vis-network/standalone";
import "./knowledgeGraph.css";

const API_BASE = process.env.REACT_APP_API_URL;

/**
 * Enhanced Knowledge Graph - Cognitrix Theme
 * Interactive visualization of student learning progress
 */

// Cognitrix theme colors
const THEME = {
  bg: "#1e2738",
  gradientBg: "linear-gradient(180deg, #1a1f2e 0%, #1e2738 50%, #1a1f2e 100%)",
  panel: "#252d3d",
  text: "#ecf0f1",
  muteText: "#95a5a6",
  border: "rgba(255, 255, 255, 0.08)",
  edge: "#5c6b80",
  accent: "#f39c12",
  accentHover: "#e67e22",
  
  // Node colors
  student: { bg: "#f39c12", border: "#e67e22" },
  courseBase: { bg: "#3498db", border: "#2980b9" },
  lectureBase: { bg: "#9b59b6", border: "#8e44ad" },
  videoWatched: { bg: "#2ecc71", border: "#27ae60" },
  videoUnwatched: { bg: "#e74c3c", border: "#c0392b" },
  highlight: { bg: "#f39c12", border: "#e67e22", text: "#111827" },
};

// Interpolate between two colors
function mixColors(color1, color2, ratio) {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);
  const r1 = (c1 >> 16) & 255, g1 = (c1 >> 8) & 255, b1 = c1 & 255;
  const r2 = (c2 >> 16) & 255, g2 = (c2 >> 8) & 255, b2 = c2 & 255;
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const TOOLTIP_STYLE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  color: #0f172a;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
`;

export default function KnowledgeGraph({ studentId }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  // Data caches
  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  const lecturesMap = useRef({});
  const videosMap = useRef({});
  const courseProgress = useRef({});
  const lectureProgress = useRef({});

  // Expanded state
  const expandedCourses = useRef(new Set());
  const expandedLectures = useRef(new Set());

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [physics, setPhysics] = useState(false);
  const [stats, setStats] = useState({ courses: 0, lectures: 0, videos: 0, watched: 0 });

  const options = useMemo(
    () => ({
      autoResize: true,
      interaction: {
        hover: true,
        tooltipDelay: 120,
        zoomView: true,
        dragView: true,
        navigationButtons: true,
      },
      layout: {
        hierarchical: {
          enabled: true,
          direction: "UD",
          levelSeparation: 160,
          nodeSpacing: 240,
          treeSpacing: 280,
          blockShifting: true,
          edgeMinimization: true,
          parentCentralization: true,
          sortMethod: "directed",
        },
      },
      physics: physics,
      nodes: {
        font: { size: 15, face: "Inter, -apple-system", color: THEME.text },
        shadow: {
          enabled: true,
          color: "rgba(0, 0, 0, 0.3)",
          size: 12,
          x: 0,
          y: 3,
        },
      },
      edges: {
        arrows: { to: false },
        color: { color: THEME.edge, hover: THEME.accent },
        smooth: { enabled: true, type: "dynamic" },
        width: 2,
        selectionWidth: 3,
      },
      groups: {
        student: {
          shape: "box",
          color: { background: THEME.student.bg, border: THEME.student.border },
          margin: 12,
          font: { size: 22, color: "#fff", bold: true },
          borderWidth: 3,
          borderWidthSelected: 4,
        },
        course: {
          shape: "box",
          color: { background: THEME.courseBase.bg, border: THEME.courseBase.border },
          margin: 10,
          font: { size: 17, color: "#fff", bold: true },
          borderWidth: 2,
          borderWidthSelected: 3,
        },
        lecture: {
          shape: "ellipse",
          color: { background: THEME.lectureBase.bg, border: THEME.lectureBase.border },
          font: { size: 15, color: "#fff" },
          borderWidth: 2,
          borderWidthSelected: 3,
        },
        video_watched: {
          shape: "dot",
          size: 20,
          color: { background: THEME.videoWatched.bg, border: THEME.videoWatched.border },
          font: { size: 13, color: "#fff" },
          borderWidth: 2,
        },
        video_unwatched: {
          shape: "dot",
          size: 20,
          color: { background: THEME.videoUnwatched.bg, border: THEME.videoUnwatched.border },
          font: { size: 13, color: "#fff" },
          borderWidth: 2,
        },
        highlight: {
          shape: "box",
          color: { background: THEME.highlight.bg, border: THEME.highlight.border },
          font: { size: 18, color: THEME.highlight.text, bold: true },
          borderWidth: 4,
        },
      },
    }),
    [physics]
  );

  // Fetch and initialize graph
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

        const nodes = [];
        const edges = [];
        let totalVideos = 0;
        let watchedVideos = 0;

        // Student node
        nodes.push({
          id: "student",
          label: `🎓 ${data.fullName || "Student"}`,
          group: "student",
          level: 0,
          title: `<div style="${TOOLTIP_STYLE}"><b>Student</b><br/>${escapeHtml(
            data.fullName || "Student"
          )}</div>`,
        });

        // Process courses
        (data.ongoingCourses || []).forEach((course) => {
          const courseId = `course-${course._id}`;
          const lectures = course.lectures || [];
          lecturesMap.current[courseId] = lectures;

          let watched = 0,
            total = 0;

          // Calculate progress
          lectures.forEach((lec) => {
            const vids = lec.videos || [];
            videosMap.current[`lecture-${courseId}-${lec.lectureNumber}`] = vids;
            vids.forEach((v) => {
              total += 1;
              if (v.watched) watched += 1;
            });
          });

          totalVideos += total;
          watchedVideos += watched;
          courseProgress.current[courseId] = { watched, total };

          const progress = total ? (watched / total) : 0;
          const percentage = Math.round(progress * 100);
          const bgColor = mixColors(THEME.courseBase.bg, THEME.videoWatched.bg, progress * 0.6);

          nodes.push({
            id: courseId,
            label: `📘 ${course.title}\n${percentage}% complete`,
            group: "course",
            level: 1,
            color: { background: bgColor, border: THEME.courseBase.border },
            title: `<div style="${TOOLTIP_STYLE}"><b>Course</b><br/>${escapeHtml(
              course.title
            )}<br/>Progress: ${percentage}%<br/>${watched}/${total} videos watched</div>`,
          });

          edges.push({ from: "student", to: courseId });
        });

        nodesRef.current = nodes;
        edgesRef.current = edges;

        // Update stats
        setStats({
          courses: data.ongoingCourses?.length || 0,
          lectures: Object.values(lecturesMap.current).flat().length,
          videos: totalVideos,
          watched: watchedVideos,
        });

        // Initialize network
        networkRef.current = new Network(
          containerRef.current,
          { nodes, edges },
          options
        );

        // Event handlers
        networkRef.current.on("click", handleClick);
        networkRef.current.on("doubleClick", handleDoubleClick);

        // Keyboard shortcuts
        const keyHandler = (e) => {
          if (e.target.tagName === "INPUT") return;
          
          switch (e.key.toLowerCase()) {
            case "f": zoomToFit(); break;
            case "e": expandAll(); break;
            case "c": collapseAll(); break;
            case "p": setPhysics((p) => !p); break;
            default: break;
          }
        };
        window.addEventListener("keydown", keyHandler);

        setLoading(false);

        return () => {
          window.removeEventListener("keydown", keyHandler);
        };
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("Error loading knowledge graph:", err);
        setError(err.message || "Failed to load knowledge graph");
        setLoading(false);
      });

    return () => {
      mounted = false;
      networkRef.current?.destroy();
      networkRef.current = null;
    };
  }, [studentId, options]);

  // Click handler - expand/collapse
  const handleClick = (params) => {
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

  // Double-click handler - focus node
  const handleDoubleClick = (params) => {
    if (!params?.nodes?.length) return;
    try {
      networkRef.current.focus(params.nodes[0], {
        scale: 1.2,
        animation: { duration: 500, easingFunction: "easeInOutQuad" },
      });
    } catch (e) {
      console.warn("Focus failed:", e);
    }
  };

  // Expand lectures for a course
  const expandLectures = (courseId) => {
    const lectures = lecturesMap.current[courseId] || [];
    const newNodes = [];
    const newEdges = [];

    lectures.forEach((lecture) => {
      const lectureId = `lecture-${courseId}-${lecture.lectureNumber}`;
      if (nodesRef.current.some((n) => n.id === lectureId)) return;

      const vids = videosMap.current[lectureId] || [];
      const total = vids.length;
      const watched = vids.filter((v) => v.watched).length;
      lectureProgress.current[lectureId] = { watched, total };

      const progress = total ? watched / total : 0;
      const percentage = Math.round(progress * 100);
      const bgColor = mixColors(THEME.lectureBase.bg, THEME.videoWatched.bg, progress * 0.6);

      newNodes.push({
        id: lectureId,
        label: `📚 Lecture ${lecture.lectureNumber}\n${percentage}% complete`,
        group: "lecture",
        level: 2,
        color: { background: bgColor, border: THEME.lectureBase.border },
        title: `<div style="${TOOLTIP_STYLE}"><b>Lecture</b> #${lecture.lectureNumber}<br/>Progress: ${percentage}%<br/>${watched}/${total} videos watched</div>`,
      });

      newEdges.push({ from: courseId, to: lectureId });
    });

    if (newNodes.length) addToGraph(newNodes, newEdges, true);
  };

  // Expand videos for a lecture
  const expandVideos = (lectureId) => {
    const videos = videosMap.current[lectureId] || [];
    const newNodes = [];
    const newEdges = [];

    videos.forEach((video, idx) => {
      const videoId = `video-${lectureId}-${idx}`;
      if (nodesRef.current.some((n) => n.id === videoId)) return;

      const watched = !!video.watched;
      newNodes.push({
        id: videoId,
        label: `${watched ? "✓" : "○"} ${truncate(video.title, 40)}`,
        group: watched ? "video_watched" : "video_unwatched",
        level: 3,
        title: `<div style="${TOOLTIP_STYLE}"><b>Video</b><br/>${escapeHtml(
          video.title
        )}<br/><i style="color: ${watched ? "#27ae60" : "#e74c3c"};">${
          watched ? "✓ Watched" : "○ Not watched"
        }</i></div>`,
      });

      newEdges.push({ from: lectureId, to: videoId });
    });

    if (newNodes.length) addToGraph(newNodes, newEdges, false);
  };

  // Add nodes/edges to graph
  const addToGraph = (newNodes, newEdges, fit = false) => {
    nodesRef.current = [...nodesRef.current, ...newNodes];
    edgesRef.current = [...edgesRef.current, ...newEdges];
    networkRef.current.setData({
      nodes: nodesRef.current,
      edges: edgesRef.current,
    });
    if (fit) zoomToFit(300);
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
      const current = stack.pop();
      const grandchildren = edgesRef.current
        .filter((e) => e.from === current)
        .map((e) => e.to);

      grandchildren.forEach((g) => {
        if (!toRemove.has(g)) {
          toRemove.add(g);
          stack.push(g);
        }
      });
    }

    nodesRef.current = nodesRef.current.filter((n) => !toRemove.has(n.id));
    edgesRef.current = edgesRef.current.filter(
      (e) => !toRemove.has(e.to) && !toRemove.has(e.from)
    );

    networkRef.current.setData({
      nodes: nodesRef.current,
      edges: edgesRef.current,
    });
  };

  // Control functions
  const zoomToFit = (duration = 600) => {
    try {
      networkRef.current?.fit({
        animation: {
          duration,
          easingFunction: "easeInOutQuad",
        },
      });
    } catch (e) {
      console.warn("Fit failed:", e);
    }
  };

  const expandAll = () => {
    const courseIds = nodesRef.current
      .filter((n) => n.id.startsWith("course-"))
      .map((n) => n.id);

    courseIds.forEach((cid) => {
      if (!expandedCourses.current.has(cid)) {
        expandLectures(cid);
        expandedCourses.current.add(cid);
      }
    });

    const lectureIds = nodesRef.current
      .filter((n) => n.id.startsWith("lecture-"))
      .map((n) => n.id);

    lectureIds.forEach((lid) => {
      if (!expandedLectures.current.has(lid)) {
        expandVideos(lid);
        expandedLectures.current.add(lid);
      }
    });

    zoomToFit();
  };

  const collapseAll = () => {
    const keepIds = new Set([
      "student",
      ...nodesRef.current
        .filter((n) => n.id.startsWith("course-"))
        .map((n) => n.id),
    ]);

    nodesRef.current = nodesRef.current.filter((n) => keepIds.has(n.id));
    edgesRef.current = edgesRef.current.filter(
      (e) => keepIds.has(e.from) && keepIds.has(e.to)
    );

    expandedCourses.current.clear();
    expandedLectures.current.clear();

    networkRef.current.setData({
      nodes: nodesRef.current,
      edges: edgesRef.current,
    });

    zoomToFit();
  };

  const exportPNG = () => {
    try {
      const canvas = networkRef.current?.canvas?.frame?.canvas;
      if (!canvas) return;

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `knowledge-graph-${Date.now()}.png`;
      link.click();
    } catch (e) {
      console.error("Export failed:", e);
      alert("Failed to export image");
    }
  };

  // Search highlight with debounce
  useEffect(() => {
    const timeout = setTimeout(() => applySearch(query), 200);
    return () => clearTimeout(timeout);
  }, [query]);

  const applySearch = (searchQuery) => {
    if (!networkRef.current) return;

    const needle = searchQuery.trim().toLowerCase();
    let firstMatch = null;

    const updatedNodes = nodesRef.current.map((node) => {
      const label = String(node.label || "").toLowerCase();
      
      if (needle && label.includes(needle)) {
        if (!firstMatch) firstMatch = node.id;
        return {
          ...node,
          group: "highlight",
          _originalGroup: node.group,
        };
      } else if (node._originalGroup) {
        return {
          ...node,
          group: node._originalGroup,
          _originalGroup: undefined,
        };
      }
      
      return node;
    });

    nodesRef.current = updatedNodes;
    networkRef.current.setData({
      nodes: nodesRef.current,
      edges: edgesRef.current,
    });

    if (firstMatch) {
      try {
        networkRef.current.focus(firstMatch, {
          scale: 1.2,
          animation: true,
        });
      } catch (e) {
        console.warn("Focus failed:", e);
      }
    }
  };

  if (loading) {
    return (
      <div className="kg-graph-loading">
        <div className="kg-graph-spinner"></div>
        <p>Loading knowledge graph...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kg-graph-error">
        <div className="kg-graph-error-icon">⚠️</div>
        <h3>Failed to Load Graph</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="kg-graph-retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="kg-graph-wrapper">
      {/* Toolbar */}
      <div className="kg-graph-toolbar">
        <div className="kg-graph-toolbar-left">
          <h2 className="kg-graph-title">
            <span className="kg-graph-title-icon">🎓</span>
            Knowledge Graph
          </h2>
        </div>

        <div className="kg-graph-toolbar-center">
          <div className="kg-graph-search-wrapper">
            <span className="kg-graph-search-icon">🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses, lectures, or videos..."
              className="kg-graph-search-input"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="kg-graph-clear-btn"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="kg-graph-toolbar-right">
          <button onClick={() => setPhysics((p) => !p)} className="kg-graph-btn" title="Toggle physics simulation">
            <span className="kg-graph-btn-icon">{physics ? "⚡" : "🔒"}</span>
            {physics ? "Physics On" : "Physics Off"}
          </button>
          <button onClick={zoomToFit} className="kg-graph-btn" title="Fit to screen (F)">
            <span className="kg-graph-btn-icon">🎯</span>
            Fit
          </button>
          <button onClick={expandAll} className="kg-graph-btn" title="Expand all nodes (E)">
            <span className="kg-graph-btn-icon">➕</span>
            Expand All
          </button>
          <button onClick={collapseAll} className="kg-graph-btn" title="Collapse all nodes (C)">
            <span className="kg-graph-btn-icon">➖</span>
            Collapse All
          </button>
          <button onClick={exportPNG} className="kg-graph-btn kg-graph-btn-accent" title="Export as PNG">
            <span className="kg-graph-btn-icon">📷</span>
            Export
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="kg-graph-stats">
        <div className="kg-graph-stat">
          <span className="kg-graph-stat-icon">📚</span>
          <span className="kg-graph-stat-value">{stats.courses}</span>
          <span className="kg-graph-stat-label">Courses</span>
        </div>
        <div className="kg-graph-stat">
          <span className="kg-graph-stat-icon">📖</span>
          <span className="kg-graph-stat-value">{stats.lectures}</span>
          <span className="kg-graph-stat-label">Lectures</span>
        </div>
        <div className="kg-graph-stat">
          <span className="kg-graph-stat-icon">🎬</span>
          <span className="kg-graph-stat-value">{stats.videos}</span>
          <span className="kg-graph-stat-label">Videos</span>
        </div>
        <div className="kg-graph-stat">
          <span className="kg-graph-stat-icon">✓</span>
          <span className="kg-graph-stat-value">{stats.watched}</span>
          <span className="kg-graph-stat-label">Watched</span>
        </div>
        <div className="kg-graph-stat kg-graph-stat-progress">
          <span className="kg-graph-stat-icon">📊</span>
          <span className="kg-graph-stat-value">
            {stats.videos ? Math.round((stats.watched / stats.videos) * 100) : 0}%
          </span>
          <span className="kg-graph-stat-label">Progress</span>
        </div>
      </div>

      {/* Legend */}
      <div className="kg-graph-legend">
        <div className="kg-graph-legend-item">
          <span className="kg-graph-legend-dot" style={{ background: THEME.student.bg }}></span>
          <span>Student</span>
        </div>
        <div className="kg-graph-legend-item">
          <span className="kg-graph-legend-dot" style={{ background: THEME.courseBase.bg }}></span>
          <span>Course</span>
        </div>
        <div className="kg-graph-legend-item">
          <span className="kg-graph-legend-dot" style={{ background: THEME.lectureBase.bg }}></span>
          <span>Lecture</span>
        </div>
        <div className="kg-graph-legend-item">
          <span className="kg-graph-legend-dot" style={{ background: THEME.videoWatched.bg }}></span>
          <span>Watched</span>
        </div>
        <div className="kg-graph-legend-item">
          <span className="kg-graph-legend-dot" style={{ background: THEME.videoUnwatched.bg }}></span>
          <span>Unwatched</span>
        </div>
        <div className="kg-graph-legend-shortcuts">
          <kbd>F</kbd> Fit · <kbd>E</kbd> Expand · <kbd>C</kbd> Collapse · <kbd>P</kbd> Physics
        </div>
      </div>

      {/* Graph Container */}
      <div ref={containerRef} className="kg-graph-container"></div>
    </div>
  );
}

// Utility functions
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function truncate(str, maxLength) {
  const s = String(str);
  return s.length > maxLength ? s.slice(0, maxLength - 1) + "…" : s;
}