
import React from "react";
import YouTubeEmbed from "./YoutubeEmbed";
import "./ClipViewer.css";

export default function ClipViewer({
selectedVideo,
timestamps,
lectureNumber,
setLectureNumber,
onSend,
}) {
return (
<div className="clipviewer-container">
    <h2>🎞️ Mini-Clips from Selected Video</h2>

    {timestamps.length === 0 ? (
    <p className="no-clips">No timestamps found for this video.</p>
    ) : (
    <div className={`clip-grid ${selectedVideo.sharedToStudentPortal ? 'clips-disabled' : ''}`}>
        {timestamps.map((clip, index) => (
        <div key={index} className="clip-card">
            <h3 className="clip-title">{clip.title}</h3>
            <p className="clip-time">
            ⏱ {clip.startTime} → {clip.endTime}
            </p>
            <YouTubeEmbed
            videoUrl={selectedVideo.youtubeurl}
            startTime={clip.startTime}
            endTime={clip.endTime}
            />
        </div>
        ))}
    </div>
    )}

    {/* Lecture Input */}
    <div className="lecture-input-section">
    <label htmlFor="lecture">📚 Lecture Number:</label>
    <input
        type="number"
        id="lecture"
        value={lectureNumber}
        min={1}
        onChange={(e) => setLectureNumber(parseInt(e.target.value))}
    />
    {/* <button onClick={() => onSend(selectedVideo, lectureNumber)}>
        🚀 Send to Lecture
    </button> */}
    <button
    onClick={() => onSend(selectedVideo, lectureNumber)}
    disabled={selectedVideo.sharedToStudentPortal}
    className={`send-button ${selectedVideo.sharedToStudentPortal ? 'disabled' : ''}`}
    >
    {selectedVideo.sharedToStudentPortal ? "✅ Already Shared" : "🚀 Send to Lecture"}
    </button>

    </div>
</div>
);
}
