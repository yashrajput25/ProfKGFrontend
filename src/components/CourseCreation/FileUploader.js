
import React, { useRef } from "react"
import "./FileUploader.css"

export default function FileUploader({onUpload}){

    const fileInputRef = useRef();

    const handleDrop = (e) => {
        e.preventDefault();
        if(e.dataTransfer.files && e.dataTransfer.files[0]){
            const file = e.dataTransfer.files[0];
            onUpload({target: {files: file}})
        }
    }

    const handleClick = () => {
        fileInputRef.current.click();
    }

    return (
        <div
        className="file-uploader"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={handleClick}
        >
<input
        type="file"
        accept=".xlsx, .xls"
        ref={fileInputRef}
        onChange={onUpload}
        style={{ display: "none" }}
    />

    <p className="upload-instruction">
        <span className="pulse-icon">📤</span> Drag & drop your Excel file or click to browse
    </p>

    <p className="upload-note">Only `.xlsx` and `.xls` files are supported</p>
        </div>
    )
}