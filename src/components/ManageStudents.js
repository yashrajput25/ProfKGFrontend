// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";

// export default function ManageStudents() {
//   const { courseId } = useParams();
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchStudents = async () => {
//       try {
//         const res = await axios.get(`http://localhost:5001/api/auth/enrolled-students/${courseId}`);
//         setStudents(res.data.students);
//       } catch (err) {
//         setStudents([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchStudents();
//   }, [courseId]);

//   const handleRemove = async (studentId) => {
//     const confirm = window.confirm("Do you really want to remove this student from the course?");
//     if (!confirm) return;
//     try {
//       await axios.put(`http://localhost:5001/api/auth/remove-student`, {
//         studentId,
//         courseId
//       });
//       setStudents((prev) => prev.filter((s) => s._id !== studentId));
//     } catch (err) {
//       alert("Failed to remove student.");
//     }
//   };

//   if (loading) return <div>Loading...</div>;

//   return (
//     <div className="manage-students-wrapper">
//       <h2>Manage Students</h2>
//       {students.length === 0 ? (
//         <p>No students enrolled in this course.</p>
//       ) : (
//         <ul>
//           {students.map((student) => (
//             <li key={student._id} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
//               <span style={{ flex: 1 }}>{student.fullName || student.name || student.email || "No Name"}</span>
//               <button onClick={() => handleRemove(student._id)} style={{ background: "#f2a064", color: "#111423", border: "none", borderRadius: "4px", padding: "4px 10px", cursor: "pointer" }}>
//                 Remove Student
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}
//       <button onClick={() => navigate(-1)} style={{ marginTop: "20px" }}>Back</button>
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./professor_dashboard.css"; // Reuse dashboard styles for consistency

export default function ManageStudents() {
  const { courseId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Get course title for header
        const courseRes = await axios.get(`http://localhost:5001/api/auth/professor-courses/${localStorage.getItem("professorId")}`);
        const course = courseRes.data.courses.find((c) => c._id === courseId);
        setCourseTitle(course ? course.title : "");

        // Get enrolled students
        const res = await axios.get(`http://localhost:5001/api/auth/enrolled-students/${courseId}`);
        setStudents(res.data.students);
      } catch (err) {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [courseId]);

  const handleRemove = async (studentId) => {
    const confirm = window.confirm("Do you really want to remove this student from the course?");
    if (!confirm) return;
    try {
      await axios.put(`http://localhost:5001/api/auth/remove-student`, {
        studentId,
        courseId
      });
      setStudents((prev) => prev.filter((s) => s._id !== studentId));
    } catch (err) {
      alert("Failed to remove student.");
    }
  };

  const filteredStudents = students.filter((student) =>
    (student.fullName || student.name || student.email || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-wrapper">
      <header>
        <div className="logo" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>Cognitrix</div>
        <nav>
          <a href="/dashboard">Home</a>
          <a href="/leaderboard">Leaderboard</a>
          <a href="/login" onClick={() => localStorage.clear()}>
            Logout
          </a>
        </nav>
      </header>

      <div className="top-section">
        <div className="professor-card">
          <div className="prof-info">
            <div className="prof-name" style={{ fontSize: "1.3rem" }}>
              Manage Students
            </div>
            <div className="prof-email" style={{ fontWeight: 400 }}>
              {courseTitle ? `Course: ${courseTitle}` : ""}
            </div>
          </div>
          <div className="left-actions">
            <button onClick={() => navigate(-1)}>Back</button>
          </div>
        </div>
      </div>

      <div className="mid-section">
        <div className="students-section" style={{ width: "100%" }}>
          <h2 className="section-heading">Enrolled Student List</h2>
          <div className="students-box">
            <div className="student-label-row">
              <span>Student Name</span>
              <input
                type="text"
                className="search-bar-top"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
            ) : filteredStudents.length === 0 ? (
              <div style={{ padding: "2rem", color: "var(--dark)", textAlign: "center" }}>
                No enrolled students found
              </div>
            ) : (
              <ul>
                {filteredStudents.map((student, idx) => (
                  <li
                    key={student._id || idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: "1px solid #e0e0e0",
                      padding: "10px 0",
                    }}
                  >
                    <span className="student-name" style={{ flex: 1 }}>
                      {student.fullName || student.name || student.email || "No Name"}
                    </span>
                    <button
                      className="see-graph-btn"
                      style={{
                        background: "#f2a064",
                        color: "#111423",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 12px",
                        marginRight: "12px",
                        cursor: "pointer",
                        fontWeight: 500
                      }}
                      onClick={() => handleRemove(student._id)}
                    >
                      Remove Student
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

