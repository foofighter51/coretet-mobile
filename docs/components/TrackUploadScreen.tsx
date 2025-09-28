import { useState, useRef } from "react";
import { Upload, Music, Cloud, Mic, X, FileAudio, Clock, HardDrive, File } from "lucide-react";
import { ScreenTemplate, ScreenSection } from "./ScreenTemplate";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ProgressBar } from "./ProgressBar";
import { LoadingState } from "./LoadingState";
import { InputWithError } from "./InputWithError";
import { ErrorBanner } from "./ErrorBanner";
import { FieldError } from "./FieldError";

interface UploadedFile {
  file: File;
  name: string;
  size: string;
  duration: string;
  format: string;
}

interface TrackUploadScreenProps {
  onCancel?: () => void;
  onUpload?: (data: any) => void;
}

const mockEnsembles = [
  { id: '1', name: 'Summer Indie Collective' },
  { id: '2', name: 'Electronic Fusion Project' },
  { id: '3', name: 'Jazz Experiments' },
  { id: '4', name: 'Acoustic Sessions' }
];

const mockCollaborators = [
  { id: '1', name: 'Sarah Martinez', username: 'sarahm' },
  { id: '2', name: 'Mike Douglas', username: 'miked' },
  { id: '3', name: 'Lisa Kim', username: 'lisak' },
  { id: '4', name: 'Alex Chen', username: 'alexc' }
];

export function TrackUploadScreen({ onCancel, onUpload }: TrackUploadScreenProps) {
  const [activeSource, setActiveSource] = useState<'device' | 'cloud' | 'record'>('device');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [trackTitle, setTrackTitle] = useState('');
  const [artists, setArtists] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEnsemble, setSelectedEnsemble] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [hasUploadError, setHasUploadError] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    artists?: string;
    ensemble?: string;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAudioDuration = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => {
        const duration = audio.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };
      audio.onerror = () => resolve('--:--');
      audio.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (files: FileList) => {
    if (files.length > 0) {
      const file = files[0];
      const duration = await getAudioDuration(file);
      
      setUploadedFile({
        file,
        name: file.name,
        size: formatFileSize(file.size),
        duration,
        format: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN'
      });

      // Set track title from filename if empty
      if (!trackTitle) {
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
        setTrackTitle(nameWithoutExtension);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleArtistInput = (value: string) => {
    setArtists(value);
    
    // Check for @ mentions
    const lastWord = value.split(' ').pop() || '';
    if (lastWord.startsWith('@') && lastWord.length > 1) {
      setMentionFilter(lastWord.slice(1));
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (collaborator: typeof mockCollaborators[0]) => {
    const words = artists.split(' ');
    words[words.length - 1] = `@${collaborator.username}`;
    setArtists(words.join(' ') + ' ');
    setShowMentions(false);
  };

  const handleUpload = async () => {
    // Validate form
    const errors: typeof formErrors = {};
    if (!trackTitle) errors.title = "Track title is required";
    if (!artists) errors.artists = "Artist name is required";  
    if (!selectedEnsemble) errors.ensemble = "Please select an ensemble";
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    if (!uploadedFile) return;

    setFormErrors({});
    setIsUploading(true);
    setUploadProgress(0);
    setHasUploadError(false);

    // Simulate upload progress with potential failure
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          // Simulate random upload failure (30% chance)
          if (Math.random() > 0.7) {
            setHasUploadError(true);
          } else {
            onUpload?.({
              file: uploadedFile,
              title: trackTitle,
              artists,
              description,
              ensemble: selectedEnsemble
            });
          }
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const filteredCollaborators = mockCollaborators.filter(collab =>
    collab.name.toLowerCase().includes(mentionFilter.toLowerCase()) ||
    collab.username.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  return (
    <div className="w-mobile h-mobile bg-off-white mx-auto overflow-hidden">
      {/* Upload Error Banner */}
      <ErrorBanner
        type="upload"
        title="Upload failed"
        message="There was a problem uploading your track. Please try again."
        actionLabel="Retry Upload"
        onAction={() => {
          setHasUploadError(false);
          handleUpload();
        }}
        onDismiss={() => setHasUploadError(false)}
        isVisible={hasUploadError}
      />
      
      <ScreenTemplate
        navigationTitle="Upload Track"
        rightAction={
          <button
            onClick={onCancel}
            className="flex items-center justify-center"
            style={{ 
              width: '44px',
              height: '44px',
              color: '#586069'
            }}
          >
            <X size={24} />
          </button>
        }
        showTabBar={false}
        contentClassName="bg-white"
      >
        {/* Source Selector Section */}
        <ScreenSection>
          <div>
            <label className="input-label">Upload Source</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveSource('device')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all ${
                  activeSource === 'device'
                    ? 'bg-white text-rdio-primary shadow-sm'
                    : 'text-rdio-secondary hover:text-text-primary'
                }`}
              >
                <Upload size={16} />
                From Device
              </button>
              <button
                onClick={() => setActiveSource('cloud')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all ${
                  activeSource === 'cloud'
                    ? 'bg-white text-rdio-primary shadow-sm'
                    : 'text-rdio-secondary hover:text-text-primary'
                }`}
              >
                <Cloud size={16} />
                From Cloud
              </button>
              <button
                onClick={() => setActiveSource('record')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all ${
                  activeSource === 'record'
                    ? 'bg-white text-rdio-primary shadow-sm'
                    : 'text-rdio-secondary hover:text-text-primary'
                }`}
              >
                <Mic size={16} />
                Record
              </button>
            </div>
          </div>
        </ScreenSection>

        {/* Upload Zone Section */}
        {activeSource === 'device' && (
          <ScreenSection>
            <div>
              <label className="input-label">Audio File</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-rdio-primary hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Music size={24} className="text-rdio-secondary" />
                  </div>
                  <p className="mb-2 text-text-primary">
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="caption text-rdio-secondary">
                    MP3, WAV, FLAC up to 100MB
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>
          </ScreenSection>
        )}

        {activeSource === 'cloud' && (
          <ScreenSection>
            <Card className="p-8 text-center">
              <Cloud size={48} className="mx-auto mb-4 text-rdio-secondary" />
              <h3 className="mb-2">Cloud Import</h3>
              <p className="text-rdio-secondary mb-4">
                Connect your cloud storage to import tracks
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="secondary">Dropbox</Button>
                <Button variant="secondary">Google Drive</Button>
                <Button variant="secondary">OneDrive</Button>
              </div>
            </Card>
          </ScreenSection>
        )}

        {activeSource === 'record' && (
          <ScreenSection>
            <Card className="p-8 text-center">
              <Mic size={48} className="mx-auto mb-4 text-rdio-secondary" />
              <h3 className="mb-2">Record Audio</h3>
              <p className="text-rdio-secondary mb-4">
                Record directly in your browser
              </p>
              <Button variant="primary">
                Start Recording
              </Button>
            </Card>
          </ScreenSection>
        )}

        {/* File Info Card Section */}
        {uploadedFile && (
          <ScreenSection>
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-rdio-primary rounded-lg flex items-center justify-center">
                  <FileAudio size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="mb-2 truncate">{uploadedFile.name}</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <HardDrive size={14} className="text-rdio-secondary" />
                      <span className="text-rdio-secondary">{uploadedFile.size}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-rdio-secondary" />
                      <span className="text-rdio-secondary">{uploadedFile.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <File size={14} className="text-rdio-secondary" />
                      <Badge variant="secondary" className="caption">
                        {uploadedFile.format}
                      </Badge>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="text-rdio-secondary hover:text-text-primary p-1"
                >
                  <X size={16} />
                </button>
              </div>
            </Card>
          </ScreenSection>
        )}

        {/* Form Fields Section */}
        <ScreenSection>
          <div className="space-y-6">
            {/* Track Title */}
            <InputWithError
              label="Track Title"
              value={trackTitle}
              onChange={(e) => setTrackTitle(e.target.value)}
              placeholder="Enter track title"
              error={formErrors.title}
            />

            {/* Artist/Collaborators */}
            <div className="relative">
              <InputWithError
                label="Artist/Collaborators"
                value={artists}
                onChange={(e) => handleArtistInput(e.target.value)}
                placeholder="Enter artists (use @ to mention collaborators)"
                error={formErrors.artists}
              />
              
              {/* Mention Dropdown */}
              {showMentions && filteredCollaborators.length > 0 && (
                <Card className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto">
                  {filteredCollaborators.map((collaborator) => (
                    <button
                      key={collaborator.id}
                      onClick={() => handleMentionSelect(collaborator)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-rdio-primary rounded-full flex items-center justify-center text-white text-sm">
                          {collaborator.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium">{collaborator.name}</p>
                          <p className="caption text-rdio-secondary">@{collaborator.username}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </Card>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="input-label">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for your track..."
                rows={4}
              />
            </div>

            {/* Ensemble Selector */}
            <div>
              <label className="input-label">Ensemble</label>
              <Select value={selectedEnsemble} onValueChange={setSelectedEnsemble}>
                <SelectTrigger className={`focus:border-rdio-primary focus:ring-rdio-primary ${formErrors.ensemble ? 'border-error' : ''}`}>
                  <SelectValue placeholder="Select an ensemble" />
                </SelectTrigger>
                <SelectContent>
                  {mockEnsembles.map((ensemble) => (
                    <SelectItem key={ensemble.id} value={ensemble.id}>
                      {ensemble.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.ensemble && (
                <div className="mt-2">
                  <FieldError message={formErrors.ensemble} />
                </div>
              )}
            </div>
          </div>
        </ScreenSection>

        {/* Upload Progress Section */}
        {isUploading && (
          <ScreenSection>
            <Card className="p-6">
              <ProgressBar 
                progress={uploadProgress}
                label="Uploading track to CoreTet..."
                size="md"
              />
              <div className="mt-4 text-center">
                <LoadingState 
                  message="Processing audio file..."
                  size="sm"
                />
              </div>
            </Card>
          </ScreenSection>
        )}

        {/* Action Buttons Section */}
        <ScreenSection>
          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={isUploading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={!uploadedFile || !trackTitle || !selectedEnsemble || isUploading}
              className="flex-1"
            >
              {isUploading ? 'Uploading...' : 'Upload Track'}
            </Button>
          </div>
        </ScreenSection>
      </ScreenTemplate>
    </div>
  );
}