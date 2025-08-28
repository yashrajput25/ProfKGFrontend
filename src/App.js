// import { Routes, Route, Link, Navigate } from "react-router-dom";
// import Login from "./components/LoginFrontend";
// import CourseCreation from "./components/CourseCreation";
// import Dashboard from "./components/Dashboard";
// import ProtectedRoute from "./components/ProtectRoute";
// import Leaderboard from "./components/Leaderboard"; // New component
// import { useEffect, useState } from "react";

// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     setIsAuthenticated(!!token);
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("email");
//     setIsAuthenticated(false);
//     window.location.href = "/login";
//   };

//   return (
//     <div>
//       {isAuthenticated ? (
//         <nav>
//           <Link to="/dashboard"></Link>
//           <div></div>
//           <Link to="/course"></Link>
//           <div></div>
//           {/* <button onClick={handleLogout}>Logout</button> */}
//         </nav>
//       ) : (
//         <nav>
//           <Link to="/login">Login</Link>
//         </nav>
//       )}

//       <Routes>
//         <Route
//           path="/login"
//           element={<Login setAuth={setIsAuthenticated} />}
//         />
//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute>
//               <Dashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/course"
//           element={
//             <ProtectedRoute>
//               <CourseCreation />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/leaderboard"
//           element={
//             <ProtectedRoute>
//               <Leaderboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route path="*" element={<Navigate to="/login" />} />
//       </Routes>
//     </div>
//   );
// }

// export default App;

import { Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./components/LoginFrontend";
import CourseCreation from "./components/CourseCreation/CourseCreation";
import Dashboard from "./components/Dashboard";
import ManagePage from "./components/ManagePage"; // Add import
import ProtectedRoute from "./components/ProtectRoute";
import Leaderboard from "./components/Leaderboard";
import { useEffect, useState } from "react";
import ProfessorSharedNotes from "./components/Pages/ProfessorSharedNotes";
import ManageStudents from "./components/ManageStudents";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  return (
    <div>
      {isAuthenticated ? (
        <nav>
          {/* <Link to="/dashboard">Dashboard</Link>
          <div></div>
          <Link to="/course">Course Creation</Link>
          <div></div> */}
          {/* <button onClick={handleLogout}>Logout</button> */}
        </nav>
      ) : (
        <nav>
          <Link to="/login">Login</Link>
        </nav>
      )}

      <Routes>
        <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course"
          element={
            <ProtectedRoute>
              <CourseCreation />
            </ProtectedRoute>
          }
        />
        <Route path="/manage-students/:courseId" element={<ManageStudents />} />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/:id" // Add this route
          element={
            <ProtectedRoute>
              <ManagePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/professor/shared-notes"
          element={
            <ProtectedRoute>
              <ProfessorSharedNotes />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
