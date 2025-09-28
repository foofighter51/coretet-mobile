import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Calendar, Clock, Users } from "lucide-react";

interface ProjectCardProps {
  title: string;
  description: string;
  progress: number;
  dueDate: string;
  collaborators: number;
  status: 'active' | 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  genre?: string;
}

const statusColors = {
  active: 'bg-accent-green',
  pending: 'bg-accent-amber text-black',
  completed: 'bg-rdio-primary',
  overdue: 'bg-red-500'
};

const priorityColors = {
  low: 'border-l-accent-green',
  medium: 'border-l-accent-amber',
  high: 'border-l-red-500'
};

export function ProjectCard({
  title,
  description,
  progress,
  dueDate,
  collaborators,
  status,
  priority,
  genre
}: ProjectCardProps) {
  return (
    <Card className={`bg-white rounded-lg shadow-subtle p-6 hover:shadow-card transition-shadow border-l-4 ${priorityColors[priority]}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="truncate">{title}</h4>
            {genre && (
              <Badge variant="secondary" className="caption">
                {genre}
              </Badge>
            )}
          </div>
          <p className="text-rdio-secondary caption leading-relaxed">
            {description}
          </p>
        </div>
        <Badge className={`caption ${statusColors[status]} text-white ml-2`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="caption text-rdio-secondary">Progress</p>
          <p className="caption">{progress}%</p>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Meta information */}
      <div className="flex items-center gap-4 text-rdio-secondary mb-4">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span className="caption">{dueDate}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users size={14} />
          <span className="caption">{collaborators} members</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          size="sm" 
          className="bg-rdio-primary hover:bg-[#006ba6] rounded-[20px] flex-1"
        >
          Continue
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-[20px]"
        >
          Details
        </Button>
      </div>
    </Card>
  );
}