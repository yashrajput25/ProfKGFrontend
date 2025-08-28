const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5004;

app.use(cors());
app.use(bodyParser.json());

let requests = [];

app.get("/requests", (req, res) => {
  res.json(requests);
});

app.post("/requests", (req, res) => {
  const { studentName, course, videoName, content } = req.body;

  const newRequest = {
    id: Date.now(),
    studentName,
    course,
    videoName,
    content,
    timestamp: new Date().toISOString(),
    status: "Pending",
    decisionTime: null,
    reviewMessage: ""
  };

  requests.push(newRequest);
  res.status(201).json({ message: "Request submitted!" });
});

app.put("/requests/:id", (req, res) => {
  const { id } = req.params;
  const { status, content, reviewMessage, editedByProfessor = false } = req.body;

  const request = requests.find((r) => r.id == id);
  if (!request) return res.status(404).json({ message: "Request not found!" });

  // Update content (even if empty string)
  if (typeof content === "string") {
    request.content = content;
  }

  // Update status and decision time
  if (status) {
    request.status = status;
    request.decisionTime = new Date().toISOString();
  }

  // Update review message if provided
  if (typeof reviewMessage === "string") {
    request.reviewMessage = reviewMessage;
  }

  // If professor approved and edited the message, auto-generate review note if not provided
  if (editedByProfessor && status === "Approved" && !reviewMessage) {
    request.reviewMessage = "Edited and approved by professor.";
  }

  res.json({ message: "Request updated successfully!", updated: request });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
