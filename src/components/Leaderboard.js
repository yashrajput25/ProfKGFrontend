// src/pages/Leaderboard.js
import React, { useEffect, useState } from "react";
import "./Leaderboard.css"; // link to CSS

const Leaderboard = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5001/api/external-leaderboard")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Sort by rank if available
          const sorted = [...data.leaderboard].sort((a, b) => (a.rank || 999) - (b.rank || 999));
          setStudents(sorted);
        }
      })
      .catch(err => console.error("Error fetching leaderboard:", err));
  }, []);

  return (

    <div className="leaderboard-container">
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
      <h1>🏆 Student Leaderboard</h1>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Badge</th>
            <th>Coins</th>
            <th>Videos Watched</th>
            <th>Courses Enrolled</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => (
            <tr key={i} className={s.rank === 1 ? "gold" : s.rank === 2 ? "silver" : s.rank === 3 ? "bronze" : ""}>
              <td>{s.rank ?? "-"}</td>
              <td>{s.fullName}</td>
              <td>
                {s.badge === 'platinum' ? '🏆' :
                s.badge === 'gold' ? '🥇' :
                s.badge === 'silver' ? '🥈' :
                s.badge === 'bronze' ? '🥉' : '-'}
              </td>
              <td>{s.coins}</td>
              <td>{s.videosWatched}</td>
              <td>{s.enrolledCourses}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
