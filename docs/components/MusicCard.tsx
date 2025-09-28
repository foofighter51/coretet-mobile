import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Play, Pause, MoreHorizontal, Heart, MessageCircle } from "lucide-react";

interface MusicCardProps {
  title: string;
  artist: string;
  collaborators: string[];
  duration?: string;
  status?: 'recording' | 'mixing' | 'complete' | 'draft';
  isPlaying?: boolean;
  onPlayPause?: () => void;
  likes?: number;
  comments?: number;
}

const statusColors = {
  recording: 'bg-accent-green',
  mixing: 'bg-accent-amber text-black',
  complete: 'bg-rdio-primary',
  draft: 'bg-[#9da7b0]'
};

export function MusicCard({ 
  title, 
  artist, 
  collaborators, 
  duration = "3:42", 
  status = 'draft',
  isPlaying = false,
  onPlayPause,
  likes = 0,
  comments = 0
}: MusicCardProps) {
  return (
    <Card className="bg-white rounded-lg shadow-subtle p-6 hover:shadow-card transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h4 className="truncate mb-1">{title}</h4>
          <p className="text-rdio-secondary caption">by {artist}</p>
        </div>
        <Button variant="ghost" size="sm" className="p-2 -mr-2">
          <MoreHorizontal size={16} />
        </Button>
      </div>

      {/* Collaborators */}
      <div className="mb-4">
        <p className="caption text-rdio-secondary mb-2">Collaborators</p>
        <div className="flex flex-wrap gap-1">
          {collaborators.map((collaborator, index) => (
            <Badge key={index} variant="secondary" className="caption">
              {collaborator}
            </Badge>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={onPlayPause}
            className="bg-rdio-primary hover:bg-[#006ba6] rounded-full w-10 h-10 p-0"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </Button>
          <span className="caption text-rdio-secondary">{duration}</span>
        </div>

        <div className="flex items-center gap-4">
          <Badge className={`caption ${statusColors[status]} text-white`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
        <button className="flex items-center gap-1 text-rdio-secondary hover:text-rdio-primary transition-colors">
          <Heart size={14} />
          <span className="caption">{likes}</span>
        </button>
        <button className="flex items-center gap-1 text-rdio-secondary hover:text-rdio-primary transition-colors">
          <MessageCircle size={14} />
          <span className="caption">{comments}</span>
        </button>
      </div>
    </Card>
  );
}