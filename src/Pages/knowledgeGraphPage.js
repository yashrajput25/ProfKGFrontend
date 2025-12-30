// import React, { useEffect, useState } from "react";
// import KnowledgeGraph from "../Components/knowledgeGraph";
// import Loader from "../Components/Loader/Loader";
// import './knowledgeGraphPage.css';

// const API_BASE = process.env.REACT_APP_API_URL;

// export default function KnowledgeGraphPage() {
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedStudentId, setSelectedStudentId] = useState(null);
//   const [search, setSearch] = useState("");
  
//   console.log("API_BASE =", process.env.REACT_APP_API_URL);

  

//   useEffect(() => {
//     async function fetchStudents() {
//       try {
//         const res = await fetch(`${API_BASE}/api/students`);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data = await res.json();
//         setStudents(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchStudents();
//   }, []);


//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const studentIdFromUrl = params.get("studentId");

//     if (studentIdFromUrl) {
//       setSelectedStudentId(studentIdFromUrl);
//     }
//   }, []);


//   const filteredStudents = students.filter(
//     (stu) =>
//       stu.fullName.toLowerCase().includes(search.toLowerCase()) ||
//       (stu.email && stu.email.toLowerCase().includes(search.toLowerCase()))
//   );

//   if (loading) {
//     return (
//       <div className="loader-placeholder">
//         <Loader />
//         <p className="loader-text">Loading students...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="error-container">
//         <div className="error-card">
//           <div className="error-icon">⚠️</div>
//           <h3>Oops! Something went wrong</h3>
//           <p>{error}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="page-wrapper">
//       <div className="page-header">
//         <h1 className="page-title">
//           <span className="title-icon">🎓</span>
//           Student Knowledge Graphs
//         </h1>
//         <p className="page-subtitle">
//           Explore and visualize student learning progress
//         </p>
//       </div>

//       {selectedStudentId ? (
//         <div className="graph-view">
//         <button
//           onClick={() => {
//             setSelectedStudentId(null);
//             window.history.replaceState({}, "", "/knowledge-graph");
//           }}
//           className="back-button"
//         >
//             <span className="back-arrow">←</span>
//             Back to Student List
//           </button>
//           <div className="graph-container">
//             <KnowledgeGraph studentId={selectedStudentId} />
//           </div>
//         </div>
//       ) : (
//         <div className="card-wrapper">
//           <div className="search-container">
//             <div className="search-wrapper">
//               <span className="search-icon">🔍</span>
//               <input
//                 type="text"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search by name or email..."
//                 className="search-input"
//               />
//               {search && (
//                 <button
//                   onClick={() => setSearch("")}
//                   className="clear-button"
//                   aria-label="Clear search"
//                 >
//                   ✕
//                 </button>
//               )}
//             </div>
//             <div className="student-count">
//               {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}
//             </div>
//           </div>

//           <div className="table-container">
//             <table className="students-table">
//               <thead>
//                 <tr>
//                   <th className="th-name">Name</th>
//                   <th className="th-email">Email</th>
//                   <th className="th-action">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredStudents.length === 0 ? (
//                   <tr>
//                     <td colSpan="3" className="empty-row">
//                       <div className="empty-state">
//                         <span className="empty-icon">🔍</span>
//                         <p>No students found</p>
//                         {search && (
//                           <button
//                             onClick={() => setSearch("")}
//                             className="reset-button"
//                           >
//                             Clear search
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredStudents.map((stu, index) => (
//                     <tr 
//                       key={stu._id} 
//                       className="table-row"
//                       style={{ animationDelay: `${index * 0.03}s` }}
//                     >
//                       <td className="td-name">
//                         <div className="student-name">
//                           <span className="avatar">
//                             {stu.fullName.charAt(0).toUpperCase()}
//                           </span>
//                           {stu.fullName}
//                         </div>
//                       </td>
//                       <td className="td-email">{stu.email || "-"}</td>
//                       <td className="td-action">
//                         <button
//                           onClick={() => setSelectedStudentId(stu._id)}
//                           className="view-button"
//                         >
//                           <span className="button-icon">📊</span>
//                           View Graph
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

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
      {/* Header */}
      <header className={`kg-header ${animateIn ? 'kg-fade-in' : ''}`}>
        <div 
          className="kg-header-logo" 
          onClick={() => navigate("/dashboard")}
        >
          <img src={cognitrixLogo} alt="Cognitrix Logo" className="kg-logo-image" />
          <span className="kg-logo-text">
            <span className="kg-logo-name">Cognitrix</span>
            <span className="kg-logo-divider">|</span>
            <span className="kg-logo-role">Professor</span>
          </span>
        </div>
        <nav className="kg-header-nav">
          <a 
            href="/dashboard" 
            className="kg-nav-link"
          >
            <span className="kg-nav-icon">🏠</span>
            <span className="kg-nav-text">Home</span>
          </a>
          <a 
            href="/leaderboard" 
            className="kg-nav-link"
          >
            <span className="kg-nav-icon">🏆</span>
            <span className="kg-nav-text">Leaderboard</span>
          </a>
          <button 
            onClick={handleLogout} 
            className="kg-nav-link kg-logout-btn"
          >
            <span className="kg-nav-icon">🚪</span>
            <span className="kg-nav-text">Logout</span>
          </button>
        </nav>
      </header>

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