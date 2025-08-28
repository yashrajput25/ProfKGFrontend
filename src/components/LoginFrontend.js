// ################################################### LOGIN PAGE #######################################################

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/Login.css"; // Import the CSS file
// import CourseCreation from "./CourseCreation/CourseCreation";
import './LoginFrontend.css'

export default function Login({setAuth}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const res = await axios.post("http://localhost:5001/api/auth/login", { email, password });
      console.log("🧠 Full login response:", res.data);
      // Your existing code
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("email", email);
      
      // ADD THESE TWO LINES HERE ↓
      // const professorId = res.data.professorId || res.data.user?.id;
      // if (professorId) {
      //   localStorage.setItem("userId", professorId);
      //   localStorage.setItem("professorId", professorId);
      // } else {
      //   console.warn("⚠️ Professor ID not found in login response");
      // }

      const professorId = res.data.professorId || res.data.user?.id;
if (professorId) {
  localStorage.setItem("userId", professorId);      // Keep for other features
  localStorage.setItem("professorId", professorId); // For dashboard
} else {
  console.warn("⚠️ Professor ID not found in login response");
}

      setMessage("✅ Login successful!");
      if(setAuth){
        setAuth(false);
      }
      navigate("/dashboard");
    
    } catch (err) {
      setMessage("❌ Invalid Credentials");
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Login</h1>
      <p className="login-subtitle">Professor</p>

      <form onSubmit={handleSubmit} className="login-form">
        <label>Email:</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
}
