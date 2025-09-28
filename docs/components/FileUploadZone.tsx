import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Cloud, Upload } from "lucide-react";

interface FileUploadZoneProps {
  onFileSelect?: (files: FileList) => void;
  className?: string;
}

export function FileUploadZone({ onFileSelect, className = "" }: FileUploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect?.(files);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect?.(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`relative cursor-pointer transition-all duration-200 ${className}`}
      style={{
        padding: '48px',
        borderRadius: '8px',
        border: isDragActive ? '2px solid #0088cc' : '2px dashed #0088cc',
        backgroundColor: isHovered ? '#e8f4f8' : '#f5fafe'
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".mp3,.wav,.flac"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="flex flex-col items-center text-center">
        {/* Upload Cloud Icon */}
        <div className="mb-4">
          <Cloud 
            size={48} 
            className="text-rdio-primary" 
          />
        </div>
        
        {/* Main Text */}
        <p 
          className="text-rdio-primary mb-2"
          style={{ 
            fontSize: '16px',
            fontWeight: '400',
            lineHeight: '1.5'
          }}
        >
          Drop audio files here or click to browse
        </p>
        
        {/* Caption */}
        <p 
          className="text-rdio-secondary"
          style={{ 
            fontSize: '12px',
            fontWeight: '400',
            lineHeight: '1.4'
          }}
        >
          Supports MP3, WAV, FLAC up to 500MB
        </p>
      </div>
      
      {/* Drag Active Overlay */}
      {isDragActive && (
        <div 
          className="absolute inset-0 bg-rdio-primary bg-opacity-5 flex items-center justify-center rounded-lg"
          style={{ borderRadius: '8px' }}
        >
          <div className="text-center">
            <Upload size={32} className="text-rdio-primary mx-auto mb-2" />
            <p className="text-rdio-primary font-medium">Drop files to upload</p>
          </div>
        </div>
      )}
    </div>
  );
}