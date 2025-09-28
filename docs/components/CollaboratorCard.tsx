import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar } from "./ui/avatar";
import { MessageCircle, UserPlus, MoreHorizontal } from "lucide-react";

interface CollaboratorCardProps {
  name: string;
  role: string;
  status: 'online' | 'offline' | 'away';
  avatar?: string;
  skills: string[];
  projectsCount: number;
  isConnected?: boolean;
  onConnect?: () => void;
  onMessage?: () => void;
}

const statusColors = {
  online: 'bg-accent-green',
  offline: 'bg-[#9da7b0]',
  away: 'bg-accent-amber'
};

export function CollaboratorCard({
  name,
  role,
  status,
  avatar,
  skills,
  projectsCount,
  isConnected = false,
  onConnect,
  onMessage
}: CollaboratorCardProps) {
  return (
    <Card className="bg-white rounded-lg shadow-subtle p-6 hover:shadow-card transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-12 h-12">
              <div className="w-full h-full bg-accent rounded-full flex items-center justify-center">
                <span className="text-lg font-medium">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
            </Avatar>
            <div 
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${statusColors[status]}`}
            />
          </div>
          <div>
            <h4 className="mb-0">{name}</h4>
            <p className="text-rdio-secondary caption">{role}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="p-2 -mr-2">
          <MoreHorizontal size={16} />
        </Button>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <p className="caption text-rdio-secondary mb-2">Skills</p>
        <div className="flex flex-wrap gap-1">
          {skills.map((skill, index) => (
            <Badge key={index} variant="secondary" className="caption">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4">
        <p className="caption text-rdio-secondary">
          {projectsCount} active projects
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isConnected ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onMessage}
            className="flex-1 rounded-[20px]"
          >
            <MessageCircle size={14} className="mr-2" />
            Message
          </Button>
        ) : (
          <Button 
            onClick={onConnect}
            size="sm"
            className="flex-1 bg-rdio-primary hover:bg-[#006ba6] rounded-[20px]"
          >
            <UserPlus size={14} className="mr-2" />
            Connect
          </Button>
        )}
      </div>
    </Card>
  );
}