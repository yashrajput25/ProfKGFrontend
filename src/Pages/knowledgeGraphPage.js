import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import KnowledgeGraph from "../Components/knowledgeGraph";
import Loader from "../Components/Loader/Loader";
import cognitrixLogo from '../Assets/cognitrixLogo_transparent.png';
import './knowledgeGraphPage.css';

const API_BASE = process.env.REACT_APP_API_URL;

export default function KnowledgeGraphPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [search, setSearch] = useState("");
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimateIn(true), 100);
  }, []);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch(`${API_BASE}/api/students`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const studentIdFromUrl = params.get("studentId");

    if (studentIdFromUrl) {
      setSelectedStudentId(studentIdFromUrl);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const filteredStudents = students.filter(
    (stu) =>
      stu.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (stu.email && stu.email.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="kg-page">
        <div className="kg-loading-container">
          <Loader />
          <p className="kg-loading-text">Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kg-page">
        <div className="kg-error-container">
          <div className="kg-error-card">
            <div className="kg-error-icon">⚠️</div>
            <h3 className="kg-error-title">Oops! Something went wrong</h3>
            <p className="kg-error-message">{error}</p>
            <button 
              className="kg-retry-button"
              onClick={() => window.location.reload()}
            >
              <span className="kg-btn-icon">🔄</span>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kg-page">

      {/* Page Content */}
      <div className={`kg-content ${animateIn ? 'kg-fade-in' : ''}`}>
        {/* Page Title */}
        <div className="kg-page-header">
          <h1 className="kg-page-title">
            <span className="kg-title-icon">🎓</span>
            Student Knowledge Graphs
          </h1>
          <p className="kg-page-subtitle">
            Explore and visualize student learning progress through interactive knowledge graphs
          </p>
        </div>

        {selectedStudentId ? (
          /* Graph View */
          <div className="kg-graph-view">
            <button
              onClick={() => {
                setSelectedStudentId(null);
                window.history.replaceState({}, "", "/knowledge-graph");
              }}
              className="kg-back-button"
            >
              <span className="kg-back-arrow">←</span>
              Back to Student List
            </button>
            <div className="kg-graph-container">
              <KnowledgeGraph studentId={selectedStudentId} />
            </div>
          </div>
        ) : (
          /* Student List View */
          <div className="kg-list-view">
            {/* Search Section */}
            <div className="kg-search-section">
              <div className="kg-search-wrapper">
                <span className="kg-search-icon">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="kg-search-input"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="kg-clear-button"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="kg-student-count">
                <span className="kg-count-number">{filteredStudents.length}</span>
                <span className="kg-count-label">
                  {filteredStudents.length === 1 ? 'student' : 'students'}
                </span>
              </div>
            </div>

            {/* Students Table */}
            <div className="kg-table-container">
              <table className="kg-students-table">
                <thead>
                  <tr>
                    <th className="kg-th kg-th-name">
                      <span className="kg-th-icon">👤</span>
                      Student Name
                    </th>
                    <th className="kg-th kg-th-email">
                      <span className="kg-th-icon">✉️</span>
                      Email Address
                    </th>
                    <th className="kg-th kg-th-action">
                      <span className="kg-th-icon">⚡</span>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="kg-empty-row">
                        <div className="kg-empty-state">
                          <div className="kg-empty-icon-wrapper">
                            <span className="kg-empty-icon">🔍</span>
                            <div className="kg-empty-glow"></div>
                          </div>
                          <h3 className="kg-empty-title">No Students Found</h3>
                          <p className="kg-empty-text">
                            {search 
                              ? `No results match "${search}"` 
                              : "No students are enrolled yet"}
                          </p>
                          {search && (
                            <button
                              onClick={() => setSearch("")}
                              className="kg-reset-button"
                            >
                              <span className="kg-btn-icon">↺</span>
                              Clear Search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((stu, index) => (
                      <tr 
                        key={stu._id} 
                        className="kg-table-row"
                        style={{ animationDelay: `${index * 0.03}s` }}
                      >
                        <td className="kg-td kg-td-name">
                          <div className="kg-student-info">
                            <div className="kg-student-avatar">
                              {stu.fullName.charAt(0).toUpperCase()}
                            </div>
                            <span className="kg-student-name">{stu.fullName}</span>
                          </div>
                        </td>
                        <td className="kg-td kg-td-email">
                          {stu.email || (
                            <span className="kg-no-data">—</span>
                          )}
                        </td>
                        <td className="kg-td kg-td-action">
                          <button
                            onClick={() => setSelectedStudentId(stu._id)}
                            className="kg-view-button"
                          >
                            <span className="kg-button-icon">📊</span>
                            <span className="kg-button-text">View Graph</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Stats Footer */}
            {filteredStudents.length > 0 && (
              <div className="kg-stats-footer">
                <div className="kg-stat-item">
                  <span className="kg-stat-icon">👥</span>
                  <span className="kg-stat-value">{students.length}</span>
                  <span className="kg-stat-label">Total Students</span>
                </div>
                <div className="kg-stat-item">
                  <span className="kg-stat-icon">🎯</span>
                  <span className="kg-stat-value">{filteredStudents.length}</span>
                  <span className="kg-stat-label">Showing</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}