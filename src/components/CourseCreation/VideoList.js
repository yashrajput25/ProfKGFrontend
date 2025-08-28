
// components/VideoList.js
import React, { useEffect, useState } from "react";
import "./VideoList.css";
import axios from "axios";

const YOUTUBE_API_KEY = "AIzaSyAHfK_94i-fmFoEWZxOnAWXGlSXK6aSdxQ"; // 🔒 Replace with your real key

export default function VideoList({ videos, onSelectVideo, fileName }) {
  const [videoTitles, setVideoTitles] = useState({});

  useEffect(() => {
    const fetchTitles = async () => {
      const titles = {};
      for (let video of videos) {
        const id = extractVideoId(video.youtubeurl);
        if (id) {
          try {
            const res = await axios.get(
              `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${YOUTUBE_API_KEY}`
            );
            const title = res.data.items[0]?.snippet?.title || video.youtubeurl;
            titles[video._id] = title;
          } catch (err) {
            titles[video._id] = video.youtubeurl; // fallback
          }
        }
      }
      setVideoTitles(titles);
    };

    if (videos.length > 0) fetchTitles();
  }, [videos]);

  return (
    <div className="video-list-container">
      <h2>🎬 Videos in <span className="file-title">{fileName}</span></h2>
      {videos.length === 0 ? (
        <p className="no-videos">No videos found for this file.</p>
      ) : (
        <div className="video-grid">
          {videos.map((video) => (
            <div
              key={video._id}
              className="video-card"
              onClick={() => onSelectVideo(video)}
              title={video.youtubeurl}
            >
              <div className="video-icon">▶️</div>
              <div className="video-url">{videoTitles[video._id] || "Loading..."}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function extractVideoId(url) {
  const regExp = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}
