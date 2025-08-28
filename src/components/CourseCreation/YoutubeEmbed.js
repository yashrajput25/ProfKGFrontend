import { useEffect, useState } from "react";
import './YoutubeEmbed.css'
export default function YouTubeEmbed({ videoUrl, startTime, endTime }) {
const [isEmbeddable, setIsEmbeddable] = useState(true);
const videoId = extractVideoId(videoUrl);
const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${convertToSeconds(startTime)}&end=${convertToSeconds(endTime)}`;

useEffect(() => {
    // Try to load the video in an iframe
    const testIframe = document.createElement("iframe");
    testIframe.src = embedUrl;
    testIframe.style.display = "none";
    document.body.appendChild(testIframe);

    testIframe.onload = () => {
    setIsEmbeddable(true);
    testIframe.remove();
    };

    testIframe.onerror = () => {
    setIsEmbeddable(false);
    testIframe.remove();
    };

    return () => testIframe.remove();
}, [embedUrl]);

return isEmbeddable ? (
    <iframe
      className="youtube-embed"
      src={embedUrl}
      allowFullScreen
    />
  ) : (
    <div className="youtube-fallback">
      🚫 This video cannot be embedded.<br />
      <a href={videoUrl} target="_blank" rel="noopener noreferrer">
        Watch on YouTube
      </a>
    </div>
  );
  
}

function extractVideoId(url) {
if (!url) return ""; // ✅ Prevents calling .match() on undefined
const regExp = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/)([^"&?\/\s]{11})/;
const match = url.match(regExp);
return match ? match[1] : "";
}



// ⏳ Convert HH:MM:SS to Seconds
function convertToSeconds(time) {
const parts = time.split(":").map(Number);
if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
if (parts.length === 2) return parts[0] * 60 + parts[1];
return parts[0];
}