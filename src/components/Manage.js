import React from "react";
import { useParams } from "react-router-dom";

export default function Manage() {
  const { id } = useParams();

  const handleManageStudents = () => {
    alert("Redirect to manage students for course ID: " + id);
  };

  const handleManageLectures = () => {
    alert("Redirect to manage lectures for course ID: " + id);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Manage Course - {id}</h1>
      <button onClick={handleManageStudents}>Manage Students</button>
      <button onClick={handleManageLectures} style={{ marginLeft: "10px" }}>
        Manage Lectures
      </button>
    </div>
  );
}
