const API_URL = "http://localhost:5004";


const submitEditedRequest = async (id) => {
    const editedContent = document.getElementById(`edited-content-${id}`).value;
  
    try {
      const response = await fetch(`${API_URL}/requests/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: editedContent,
          status: "Approved",
          editedByProfessor: true
        })
      });
  
      if (response.ok) {
        alert("Student message edited and approved.");
        fetchNotes(); // this should exist already
      } else {
        alert("Failed to submit edited message.");
      }
    } catch (error) {
      console.error("Error submitting edited message:", error);
    }
  };
  
  
  
// Function to fetch and display requests
const fetchRequests = async () => {
  try {
    const response = await fetch(`${API_URL}/requests`);
    const data = await response.json();
    const requestsContainer = document.getElementById("requests");

    requestsContainer.innerHTML = "";

    if (data.length === 0) {
      requestsContainer.innerHTML = "<p>No requests found.</p>";
      return;
    }

    data.forEach((note) => {
      const noteDiv = document.createElement("div");
      noteDiv.classList.add("note-item");

      const timestamp = note.timestamp ? new Date(note.timestamp).toLocaleString() : "No Date";

      noteDiv.innerHTML = `
        <div class="note-details">
          <p><strong>Student:</strong> ${note.studentName}</p>
          <p><strong>Course:</strong> ${note.course}</p>
          <p><strong>Video:</strong> ${note.videoName}</p>
          <p><strong>Message:</strong> ${note.content}</p>
          <p><strong>Professor Advice:</strong> ${note.reviewMessage || "None"}</p>
          <p><strong>Status:</strong> ${note.status}</p>
          <p class="timestamp"><strong>Request Time:</strong> ${timestamp}</p>
          <textarea class="review-input" placeholder="Write feedback...">${note.reviewMessage || ""}</textarea>
          <textarea class="edit-message-input" placeholder="Edit message (optional)...">${note.content}</textarea>
        </div>
        <div>
          <button class="under-review-btn" data-id="${note.id}">Under Review</button>
          <button class="approve-btn" data-id="${note.id}">Approve</button>
          <button class="reject-btn" data-id="${note.id}">Reject</button>
        </div>
      `;
      requestsContainer.appendChild(noteDiv);
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
  }
};

// Function to edit message when student resubmits
const editMessage = async (id) => {
  const newMessage = document.getElementById("message-input").value;

  try {
    const response = await fetch(`${API_URL}/requests/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content: newMessage, reviewMessage: "" }) // Clear professor advice on student resubmit
    });

    const data = await response.json();
    if (response.ok) {
      alert("Message updated successfully!");
      fetchRequests();
    } else {
      alert("Error updating message: " + data.message);
    }
  } catch (error) {
    console.error("Error updating message:", error);
  }
};

// Attach listener for student resubmit button (if on same page)
document.getElementById("resubmit-btn")?.addEventListener("click", function () {
  const requestId = document.getElementById("request-id").value;
  editMessage(requestId);
});

// Delegate professor button actions
document.addEventListener("click", async (e) => {
  const target = e.target;
  const id = target.dataset.id;

  if (!id) return;

  const noteItem = target.closest(".note-item");
  const advice = noteItem.querySelector(".review-input")?.value;
  const editedMessage = noteItem.querySelector(".edit-message-input")?.value;

  if (target.classList.contains("under-review-btn")) {
    await fetch(`${API_URL}/requests/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: "Under Review",
        reviewMessage: advice
      })
    });
    alert("Marked as Under Review.");
    fetchRequests();
  }

  if (target.classList.contains("approve-btn")) {
    await fetch(`${API_URL}/requests/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: "Approved",
        content: editedMessage
      })
    });
    alert("Approved with or without edit.");
    fetchRequests();
  }

  if (target.classList.contains("reject-btn")) {
    await fetch(`${API_URL}/requests/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: "Rejected" })
    });
    alert("Rejected.");
    fetchRequests();
  }
});

// Initial load
fetchRequests();
