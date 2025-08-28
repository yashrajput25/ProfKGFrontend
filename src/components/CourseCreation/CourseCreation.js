import { useState, useEffect } from "react";
import { uploadExcelFile, getUploadedFiles, getVideosFromFile, getVideoTimestamps,linkFileToCourse, markVideoAsShared } from "../api";
import axios from "axios";
import { professorHeaders } from "../StudentPortalAPI"; 
import { createCourseInStudentPortal } from "../StudentPortalAPI";
import FileUploader from "./FileUploader";
import FileList from "./FileList";
import VideoList from "./VideoList";
import ClipViewer from "./ClipViewer";
import { Link } from "react-router-dom";
import "./CourseCreation.css";

export default function CourseCreation() {
  const [files, setFiles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [timestamps, setTimestamps] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [lectureNumber, setLectureNumber] = useState(1);
  const professorId = localStorage.getItem("userId");
  


  useEffect(() => {
    fetchFiles();
  }, []);

  /* It guides you through creating a course and 
  then automatically links your chosen Excel file to it, */

  const handleCreateCourse = async () => {
    const title = prompt("Enter course title:");
    if (!title) return;
  
    const description = prompt("Optional: Add course description") || "";
  
    if (!selectedFile || !selectedFile._id) {
      alert("❌ No Excel file selected. Please click on a file first.");
      return;
    }
  
    try {
      console.log("👨‍🏫 professorId:", professorId); // ✅ This must print a valid ObjectId

      if (!professorId) {
        alert("❌ Professor ID not found in localStorage!");
        return;
      }
      const res = await createCourseInStudentPortal({ title, description, creator: professorId });
      console.log("🚀 Full response from createCourseInStudentPortal:", res.data);
  
      const courseId = res.data.courseId;
      alert(`✅ Course created successfully! Course ID: ${courseId}`);
  
      await linkFileToCourse(selectedFile._id, courseId, title);

  
      alert("✅ Course created and linked to Excel file!");
      fetchFiles();

    } catch (error) {
      console.error("❌ Error creating course:", error.response?.data || error.message);
      alert("Failed to create course. See console.");
    }
  };
  
  /* It efficiently takes all the individual clips from an Excel-parsed video, 
  sends them to a course in student portal backend, 
  marks the original video as processed in prof backend, 
  and updates your display. */

  const handleSendToLecture = async (video, lectureNum) => {
    const courseId = selectedFile?.courseId;
    if (!courseId) {
      alert("❌ This Excel file is not linked to a course. Please create a course first.");
      return;
    }
  
    try {
      const sortedTimestamps = [...timestamps].sort((a, b) => {
        return convertToSeconds(a.startTime) - convertToSeconds(b.startTime);
      });
      const sendTasks = sortedTimestamps.map((clip, i) => {
        const payload = {
          title: clip.title,
          description: clip.description || " ",
          lectureNumber: clip.lectureNumber || lectureNum,
          videoNumber: i + 1,
          duration: calculateDuration(clip.startTime, clip.endTime),
          url: video.youtubeurl,
          startTime: convertToSeconds(clip.startTime),
          endTime: convertToSeconds(clip.endTime),
        };
  
        console.log("📤 Payload being sent:", payload);
  
        return axios.post(
          `http://localhost:3000/api/video/${courseId}`,
          payload,
          professorHeaders()
        );
      });
  
      const results = await Promise.allSettled(sendTasks);
  
      results.forEach((result, idx) => {
        if (result.status === "rejected") {
          console.warn(`⚠️ Clip ${idx + 1} failed:`, result.reason);
        }
      });
  
      console.log("🎯 Finished sending all clips. Now marking as shared...");

      try {
        const patchRes = await markVideoAsShared(video._id);

        console.log("✅ Video marked as shared:", patchRes.data);
      } catch (err) {
        console.error("❌ Failed to mark video as shared:", err);
      }
      
      // ✅ Continue regardless of mark-shared outcome
      const updatedVideos = await getVideosFromFile(selectedFile._id);
      setVideos([...updatedVideos.data]);

      // 🔄 Update selectedVideo reference too
const updatedSelected = updatedVideos.data.find(v => v._id === video._id);
setSelectedVideo(updatedSelected);

      
      console.log("✅ Refresh complete. Showing success message.");
      alert("✅ All mini-clips sent and video marked as shared!");
  
    } catch (error) {
      console.error("❌ Uncaught error:", error);
      alert("❌ Something went wrong. See console.");
    }
  };
  
  
  function convertToSeconds(time) {
    const parts = time.split(":").map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0];
  }

  
  function calculateDuration(startTime, endTime) {
    const start = convertToSeconds(startTime);
    const end = convertToSeconds(endTime);
    const durationSec = Math.max(0, end - start);
  
    const minutes = Math.floor(durationSec / 60);
    const seconds = durationSec % 60;
  
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  


  // ##################################### COURSE CREATION ####################################

  // 📂 Fetch uploaded Excel files
  const fetchFiles = async () => {
    try {
      const response = await getUploadedFiles();
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  // 📤 Upload a new Excel file
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await uploadExcelFile(file);
      alert("✅ File uploaded successfully!");
      fetchFiles(); // Refresh file list
    } catch (error) {
      alert("❌ Error uploading file.");
      console.error("Upload error:", error);
    }
  };

  // 📺 Fetch videos from a selected file
  const fetchVideos = async (file) => {
    setSelectedFile(file);
    setSelectedVideo(null);
    setTimestamps([]);
    try {
      const response = await getVideosFromFile(file._id);
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  // 🎬 Fetch timestamps from a selected video
  const fetchTimestamps = async (video) => {
    setSelectedVideo(video);
    try {
      console.log("📺 Fetching timestamps for video ID:", video._id);
      console.log("🔐 User token:", localStorage.getItem("token"));
      const response = await getVideoTimestamps(video._id);
      setTimestamps(response.data);
    } catch (error) {
      console.error("Error fetching timestamps:", error);
    }
  };


    return (
      <div className="course-page-wrapper">
        {/* Top Navbar like Dashboard */}
        <header className="cognitrix-header">
          <div className="logo">Cognitrix</div>
          <nav className="nav-links">
            <Link to="/dashboard" className="nav-btn">Home</Link>
            <Link to="/leaderboard" className="nav-btn">Leaderboard</Link>
            <Link to="/logout" className="nav-btn">Logout</Link>
          </nav>
        </header>
  
        <div className="course-page-container">
          <h1 className="course-title">📚 Course Creation</h1>
  
          <FileUploader onUpload={handleUpload} />
  
          <FileList
            files={files}
            onSelectFile={fetchVideos}
            onCreateCourse={handleCreateCourse}
          />
  
          {selectedFile && (
            <VideoList
              videos={videos}
              fileName={selectedFile.filename}
              onSelectVideo={fetchTimestamps}
            />
          )}
  
          {selectedVideo && (
            <ClipViewer
              selectedVideo={selectedVideo}
              timestamps={timestamps}
              lectureNumber={lectureNumber}
              setLectureNumber={setLectureNumber}
              onSend={handleSendToLecture}
            />
          )}
        </div>
      </div>
    );
  }
  

