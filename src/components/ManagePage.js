// frontend/src/components/ManagePage.js
import { useParams } from "react-router-dom";

export default function ManagePage() {
  const { id } = useParams();

  return (
    <div>
      <h1>Manage Course - {id}</h1>
      <button onClick={() => alert("Redirect to Manage Students")}>Manage Students</button>
      <button onClick={() => alert("Redirect to Manage Lectures")}>Manage Lectures</button>
    </div>
  );
}
