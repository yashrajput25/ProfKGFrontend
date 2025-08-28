// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./professor_dashboard.css";
// import { useNavigate } from "react-router-dom";
// import ProfessorSharedNotes from "./Pages/ProfessorSharedNotes";

// export default function Dashboard() {
//   const [name, setName] = useState("Professor");
//   const [email, setEmail] = useState("example@gmail.com");
//   const navigate = useNavigate();

//   const [notifications, setNotifications] = useState([
//     { message: "Rohan: sir accept the new changes", read: false },
//     { message: "Anshul: Notes uploaded", read: true },
//     { message: "Rohan: sir accept the new changes", read: false },
//     { message: "Rohan: sir accept the new changes", read: true },
//     { message: "Rohan: sir accept the new changes", read: false },
//   ]);

//   const [searchNotif, setSearchNotif] = useState("");

//   const filteredNotifs = notifications.filter((n) =>
//     n.message.toLowerCase().includes(searchNotif.toLowerCase())
//   );

//   const toggleRead = (index) => {
//     setNotifications((prev) =>
//       prev.map((notif, idx) =>
//         idx === index ? { ...notif, read: !notif.read } : notif
//       )
//     );
//   };

//   const clearNotifications = () => {
//     setNotifications([]);
//   };

//   // Courses state now fetched from backend
//   const [courses, setCourses] = useState([]);
//   const [selectedCourse, setSelectedCourse] = useState(null);

//   const handleDelete = (courseId) => {
//     if (window.confirm("Delete this course?")) {
//       alert("Course deleted (simulated — not connected to DB yet).");
//       setCourses((prevCourses) =>
//         prevCourses.filter((course) => course.id !== courseId)
//       );
//     }
//   };

//   const studentList = [
//     "Kshitija Randive",
//     "Diksha Kumari Pareta",
//     "Abhishek Gond",
//     "Nimish Goyal",
//     "Yash Rajput",
//   ];

//   const [searchTerm, setSearchTerm] = useState("");
//   const filteredStudents = studentList.filter((student) =>
//     student.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const userEmail = localStorage.getItem("email");
//     if (!token || !userEmail) {
//       navigate("/login");
//     } else {
//       const derivedName = userEmail.split("@")[0];
//       setName(derivedName);
//       setEmail(userEmail);
//     }
//   }, [navigate]);

//   useEffect(() => {
//     const fetchCourses = async () => {
//       try {
//         const professorId = localStorage.getItem("professorId");
//         console.log("professorId from localStorage:", professorId);
//         if (!professorId) {
//           setCourses([]);
//           setSelectedCourse(null);
//           return;
//         }
//         const res = await axios.get(`http://localhost:5001/api/auth/professor-courses/${professorId}`);
//         console.log("Fetched courses from backend:", res.data.courses);
//         const dbCourses = res.data.courses.map((c) => ({
//           id: c._id,
//           name: c.title,
//           studentsEnrolled: c.numEnrolledStudents || 0,
//           completion: Math.floor(Math.random() * 100), // Placeholder
//           due: Math.floor(Math.random() * 30),         // Placeholder
//           notEnrolled: Math.floor(Math.random() * 20), // Placeholder
//         }));
//         setCourses(dbCourses);
//         setSelectedCourse(dbCourses[0] || null);
//       } catch (err) {
//         console.error("Error fetching courses on frontend:", err);
//         setCourses([]);
//         setSelectedCourse(null);
//       }
//     };

//     fetchCourses();
//   }, []);

//   return (
//     <div className="dashboard-wrapper">
//       <header>
//         <div className="logo">Cognitrix</div>
//         <nav>
//           <a href="/dashboard">Home</a>
//           <a href="/leaderboard">Leaderboard</a>
//           <a href="/login" onClick={() => localStorage.clear()}>
//             Logout
//           </a>
//         </nav>
//       </header>

//       <div className="top-section">
//         <div className="professor-card">
//           <div className="prof-img"></div>
//           <div className="prof-info">
//             <div className="prof-name">Hi, {name}</div>
//             <div className="prof-email">{email}</div>
//           </div>
//           <div className="left-actions">
//             <button onClick={() => navigate("/course")}>Add Courses</button>
//             <button>Announcement</button>
//             <button onClick={() => navigate("/professor/shared-notes")}>
//               Shared Comments
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="mid-section">
//         <div className="course-progress-wrapper">
//           {/* Courses Added Section */}
//           <div className="course-section-wrapper">
//             <h2 className="section-heading">Courses Added</h2>
//             <div className="course-section">
//               <div className="courses-wrapper">
//                 <div className="courses-box">
//                   {courses.map((course) => (
//                     <div
//                       key={course.id}
//                       className={`course-card ${
//                         selectedCourse && selectedCourse.id === course.id ? "active" : ""
//                       }`}
//                       onClick={() => setSelectedCourse(course)}
//                     >
//                       <h3>{course.name}</h3>
//                       <p>{name}</p>
//                       <div className="card-buttons">
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             navigate(`/manage/${course.id}`);
//                           }}
//                         >
//                           Manage
//                         </button>
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleDelete(course.id);
//                           }}
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="see-all">
//                   <button onClick={() => navigate("/course")}>See All Courses →</button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Course Completion Section */}
//           <div className="course-completion-wrapper">
//             <h2 className="section-heading">Course Completion</h2>
//             <div className="progress-box">
//               <div className="progress-ring">
//                 <svg>
//                   <circle className="circle-bg" cx="80" cy="80" r="62" />
//                   <circle
//                     className="circle"
//                     cx="80"
//                     cy="80"
//                     r="62"
//                     strokeDasharray={`${selectedCourse ? selectedCourse.completion * 3.9 : 0}, 390`}
//                   />
//                 </svg>
//               </div>
//               <div className="legend">
//                 <div>
//                   <span className="dot completed"></span>
//                   {selectedCourse ? selectedCourse.completion : 0}% Completed
//                 </div>
//                 <div>
//                   <span className="dot due"></span>
//                   {selectedCourse ? selectedCourse.due : 0}% Due
//                 </div>
//                 <div>
//                   <span className="dot not-enrolled"></span>
//                   {selectedCourse ? selectedCourse.notEnrolled : 0}% Not Enrolled
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="bottom-section">
//         {/* Enrolled Students Section */}
//         <div className="students-section">
//           <h2 className="section-heading">Enrolled Student List</h2>
//           <div className="students-box">
//             <div className="student-label-row">
//               <span>Student Name</span>
//               <input
//                 type="text"
//                 className="search-bar-top"
//                 placeholder="Search"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>

//             <ul>
//               {filteredStudents.map((student, idx) => (
//                 <li key={idx}>
//                   <span className="student-name">{student}</span>
//                   <button
//                     className="see-graph-btn"
//                     onClick={() => navigate("/dashboard")}
//                   >
//                     See Knowledge Graph
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>

//         {/* Notifications Section */}
//         <div className="notifications-section">
//           <div className="section-header">
//             <h2 className="section-heading">
//               Notifications <span className="notif-count">{notifications.length}</span>
//             </h2>
//             <button className="clear-btn" onClick={clearNotifications}>
//               Clear All
//             </button>
//           </div>

//           <div className="notifications-box">
//             <ul>
//               {filteredNotifs.length > 0 ? (
//                 filteredNotifs.map((notif, idx) => (
//                   <li
//                     key={idx}
//                     className={notif.read ? "" : "highlight"}
//                     onClick={() => toggleRead(idx)}
//                   >
//                     {notif.message}
//                   </li>
//                 ))
//               ) : (
//                 <li style={{ color: "var(--dark)" }}>No notifications found</li>
//               )}
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import axios from "axios";
import "./professor_dashboard.css";
import { useNavigate } from "react-router-dom";
import ProfessorSharedNotes from "./Pages/ProfessorSharedNotes";

export default function Dashboard() {
  const [name, setName] = useState("Professor");
  const [email, setEmail] = useState("example@gmail.com");
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([
    { message: "Rohan: sir accept the new changes", read: false },
    { message: "Anshul: Notes uploaded", read: true },
    { message: "Rohan: sir accept the new changes", read: false },
    { message: "Rohan: sir accept the new changes", read: true },
    { message: "Rohan: sir accept the new changes", read: false },
  ]);

  const [searchNotif, setSearchNotif] = useState("");

  const filteredNotifs = notifications.filter((n) =>
    n.message.toLowerCase().includes(searchNotif.toLowerCase())
  );

  const toggleRead = (index) => {
    setNotifications((prev) =>
      prev.map((notif, idx) =>
        idx === index ? { ...notif, read: !notif.read } : notif
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Courses state now fetched from backend
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // NEW: Enrolled students state
  const [enrolledStudents, setEnrolledStudents] = useState([]);

  const handleDelete = (courseId) => {
    if (window.confirm("Delete this course?")) {
      alert("Course deleted (simulated — not connected to DB yet).");
      setCourses((prevCourses) =>
        prevCourses.filter((course) => course.id !== courseId)
      );
    }
  };

  // Search term for enrolled students
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch professor info
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("email");
    if (!token || !userEmail) {
      navigate("/login");
    } else {
      const derivedName = userEmail.split("@")[0];
      setName(derivedName);
      setEmail(userEmail);
    }
  }, [navigate]);

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const professorId = localStorage.getItem("professorId");
        if (!professorId) {
          setCourses([]);
          setSelectedCourse(null);
          return;
        }
        const res = await axios.get(`http://localhost:5001/api/auth/professor-courses/${professorId}`);
        const dbCourses = res.data.courses.map((c) => ({
          id: c._id,
          name: c.title,
          studentsEnrolled: c.numEnrolledStudents || 0,
          completion: Math.floor(Math.random() * 100), // Placeholder
          due: Math.floor(Math.random() * 30),         // Placeholder
          notEnrolled: Math.floor(Math.random() * 20), // Placeholder
        }));
        setCourses(dbCourses);
        setSelectedCourse(dbCourses[0] || null);
      } catch (err) {
        setCourses([]);
        setSelectedCourse(null);
      }
    };

    fetchCourses();
  }, []);

  // Fetch enrolled students when selectedCourse changes
  useEffect(() => {
    const fetchEnrolledStudents = async () => {
      if (!selectedCourse) {
        setEnrolledStudents([]);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5001/api/auth/enrolled-students/${selectedCourse.id}`);
        setEnrolledStudents(res.data.students);
      } catch (err) {
        setEnrolledStudents([]);
      }
    };
    fetchEnrolledStudents();
  }, [selectedCourse]);

  // Filter students by search term
  const filteredStudents = enrolledStudents.filter((student) =>
    (student.fullName || student.name || student.email || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-wrapper">
      <header>
        <div className="logo">Cognitrix</div>
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
          <div className="prof-img"></div>
          <div className="prof-info">
            <div className="prof-name">Hi, {name}</div>
            <div className="prof-email">{email}</div>
          </div>
          <div className="left-actions">
            <button onClick={() => navigate("/course")}>Add Courses</button>
            <button>Announcement</button>
            <button onClick={() => navigate("/professor/shared-notes")}>
              Shared Comments
            </button>
          </div>
        </div>
      </div>

      <div className="mid-section">
        <div className="course-progress-wrapper">
          {/* Courses Added Section */}
          <div className="course-section-wrapper">
            <h2 className="section-heading">Courses Added</h2>
            <div className="course-section">
              <div className="courses-wrapper">
                <div className="courses-box">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className={`course-card ${
                        selectedCourse && selectedCourse.id === course.id ? "active" : ""
                      }`}
                      onClick={() => setSelectedCourse(course)}
                    >
                      <h3>{course.name}</h3>
                      <p>{name}</p>
                      <div className="card-buttons">
                      <button
  onClick={(e) => {
    e.stopPropagation();
    navigate(`/manage-students/${course.id}`);
  }}
>
  Manage
</button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(course.id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="see-all">
                  <button onClick={() => navigate("/course")}>See All Courses →</button>
                </div>
              </div>
            </div>
          </div>

          {/* Course Completion Section */}
          <div className="course-completion-wrapper">
            <h2 className="section-heading">Course Completion</h2>
            <div className="progress-box">
              <div className="progress-ring">
                <svg>
                  <circle className="circle-bg" cx="80" cy="80" r="62" />
                  <circle
                    className="circle"
                    cx="80"
                    cy="80"
                    r="62"
                    strokeDasharray={`${selectedCourse ? selectedCourse.completion * 3.9 : 0}, 390`}
                  />
                </svg>
              </div>
              <div className="legend">
                <div>
                  <span className="dot completed"></span>
                  {selectedCourse ? selectedCourse.completion : 0}% Completed
                </div>
                <div>
                  <span className="dot due"></span>
                  {selectedCourse ? selectedCourse.due : 0}% Due
                </div>
                <div>
                  <span className="dot not-enrolled"></span>
                  {selectedCourse ? selectedCourse.notEnrolled : 0}% Not Enrolled
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-section">
        {/* Enrolled Students Section */}
        <div className="students-section">
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

            <ul>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, idx) => (
                  <li key={student._id || idx}>
                    <span className="student-name">
                      {student.fullName || student.name || student.email || "No Name"}
                    </span>
                    <button
                      className="see-graph-btn"
                      onClick={() => navigate("/dashboard")}
                    >
                      See Knowledge Graph
                    </button>
                  </li>
                ))
              ) : (
                <li style={{ color: "var(--dark)" }}>No enrolled students found</li>
              )}
            </ul>
          </div>
        </div>

        {/* Notifications Section
        <div className="notifications-section">
          <div className="section-header">
            <h2 className="section-heading">
              Notifications <span className="notif-count">{notifications.length}</span>
            </h2>
            <button className="clear-btn" onClick={clearNotifications}>
              Clear All
            </button>
          </div>

          <div className="notifications-box">
            <ul>
              {filteredNotifs.length > 0 ? (
                filteredNotifs.map((notif, idx) => (
                  <li
                    key={idx}
                    className={notif.read ? "" : "highlight"}
                    onClick={() => toggleRead(idx)}
                  >
                    {notif.message}
                  </li>
                ))
              ) : (
                <li style={{ color: "var(--dark)" }}>No notifications found</li>
              )}
            </ul>
          </div>
        </div> */}
      </div>
    </div>
  );
}
