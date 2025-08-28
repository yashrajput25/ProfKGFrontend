
import React, { useEffect, useState } from "react";
import KnowledgeGraph from "../Components/knowledgeGraph";

const API_BASE = process.env.REACT_APP_API_URL;
export default function KnowledgeGraphPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch(`${API_BASE}/api/students`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (stu) =>
      stu.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (stu.email && stu.email.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <p style={{ padding: 20 }}>Loading students…</p>;
  if (error) return <p style={{ padding: 20, color: "red" }}>Error: {error}</p>;

  return (
    <div style={pageWrapper}>
      <h2 style={titleStyle}>🎓 Student Knowledge Graphs</h2>

      {selectedStudentId ? (
        <div>
          <button
            onClick={() => setSelectedStudentId(null)}
            style={backButtonStyle}
          >
            ← Back to Student List
          </button>
          <KnowledgeGraph studentId={selectedStudentId} />
        </div>
      ) : (
        <div style={cardWrapper}>
          {/* Search Bar */}
          <div style={{ marginBottom: 20, textAlign: "right" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search students..."
              style={searchStyle}
            />
          </div>

          {/* Table */}
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="3" style={emptyRowStyle}>
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => (
                  <tr key={stu._id} style={tbodyRowStyle}>
                    <td style={tdStyle}>{stu.fullName}</td>
                    <td style={tdStyle}>{stu.email || "-"}</td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <button
                        onClick={() => setSelectedStudentId(stu._id)}
                        style={buttonStyle}
                      >
                        See Knowledge Graph
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ===== Styles ===== //
const pageWrapper = {
  padding: 20,
  fontFamily: "Inter, sans-serif",
  background: "#0f172a",
  color: "#f1f5f9",
  minHeight: "100vh",
};

const titleStyle = {
  textAlign: "center",
  marginBottom: 20,
  fontSize: 22,
  fontWeight: 700,
  color: "#f8fafc",
};

const cardWrapper = {
  background: "#1e293b",
  borderRadius: 12,
  padding: 20,
  boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  borderRadius: 10,
  overflow: "hidden",
};

const thStyle = {
  textAlign: "left",
  padding: 12,
  fontSize: 14,
  fontWeight: 600,
  color: "#f1f5f9",
  background: "#334155",
};

const tbodyRowStyle = {
  borderBottom: "1px solid #334155",
  transition: "background 0.2s",
};

const tdStyle = {
  padding: 12,
  fontSize: 14,
  color: "#e2e8f0",
};

const emptyRowStyle = {
  padding: 20,
  textAlign: "center",
  color: "#94a3b8",
};

const buttonStyle = {
  padding: "6px 14px",
  background: "#f97316",
  color: "white",
  border: "none",
  borderRadius: 6,
  fontSize: 13,
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
  transition: "background 0.2s",
};

const searchStyle = {
  width: "40%",
  padding: "10px 14px",
  border: "1px solid #475569",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  background: "#0f172a",
  color: "#f1f5f9",
  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2)",
};

const backButtonStyle = {
  marginBottom: 20,
  padding: "6px 14px",
  background: "#64748b",
  color: "white",
  border: "none",
  borderRadius: 6,
  fontSize: 13,
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
};