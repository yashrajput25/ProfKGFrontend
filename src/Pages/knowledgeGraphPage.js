import React, { useEffect, useState } from "react";
import KnowledgeGraph from "../Components/knowledgeGraph";
import Loader from "../Components/Loader/Loader";
import './knowledgeGraphPage.css';

const API_BASE = process.env.REACT_APP_API_URL;

export default function KnowledgeGraphPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [search, setSearch] = useState("");
  
  console.log("API_BASE =", process.env.REACT_APP_API_URL);

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

  if (loading) {
    return (
      <div className="loader-placeholder">
        <Loader />
        <p className="loader-text">Loading students...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">
          <span className="title-icon">🎓</span>
          Student Knowledge Graphs
        </h1>
        <p className="page-subtitle">
          Explore and visualize student learning progress
        </p>
      </div>

      {selectedStudentId ? (
        <div className="graph-view">
          <button
            onClick={() => setSelectedStudentId(null)}
            className="back-button"
          >
            <span className="back-arrow">←</span>
            Back to Student List
          </button>
          <div className="graph-container">
            <KnowledgeGraph studentId={selectedStudentId} />
          </div>
        </div>
      ) : (
        <div className="card-wrapper">
          <div className="search-container">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="search-input"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="clear-button"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="student-count">
              {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}
            </div>
          </div>

          <div className="table-container">
            <table className="students-table">
              <thead>
                <tr>
                  <th className="th-name">Name</th>
                  <th className="th-email">Email</th>
                  <th className="th-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="empty-row">
                      <div className="empty-state">
                        <span className="empty-icon">🔍</span>
                        <p>No students found</p>
                        {search && (
                          <button
                            onClick={() => setSearch("")}
                            className="reset-button"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((stu, index) => (
                    <tr 
                      key={stu._id} 
                      className="table-row"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <td className="td-name">
                        <div className="student-name">
                          <span className="avatar">
                            {stu.fullName.charAt(0).toUpperCase()}
                          </span>
                          {stu.fullName}
                        </div>
                      </td>
                      <td className="td-email">{stu.email || "-"}</td>
                      <td className="td-action">
                        <button
                          onClick={() => setSelectedStudentId(stu._id)}
                          className="view-button"
                        >
                          <span className="button-icon">📊</span>
                          View Graph
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}