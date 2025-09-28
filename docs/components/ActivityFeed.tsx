import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar } from "./ui/avatar";
import { Clock, Music, MessageCircle, UserPlus, Upload } from "lucide-react";

interface ActivityItem {
  id: string;
  type: 'track_uploaded' | 'comment_added' | 'collaborator_joined' | 'project_completed';
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const activityIcons = {
  track_uploaded: Upload,
  comment_added: MessageCircle,
  collaborator_joined: UserPlus,
  project_completed: Music
};

const activityColors = {
  track_uploaded: 'text-accent-green',
  comment_added: 'text-rdio-primary',
  collaborator_joined: 'text-accent-amber',
  project_completed: 'text-accent-teal'
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="bg-white rounded-lg shadow-subtle p-6">
      <h4 className="mb-4">Recent Activity</h4>
      
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type];
          const colorClass = activityColors[activity.type];
          
          return (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-off-white transition-colors">
              <div className={`p-2 rounded-full bg-gray-100 ${colorClass}`}>
                <Icon size={16} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="caption">
                  <span className="font-medium text-text-primary">
                    {activity.user}
                  </span>{' '}
                  <span className="text-rdio-secondary">
                    {activity.action}
                  </span>{' '}
                  <span className="font-medium text-text-primary">
                    {activity.target}
                  </span>
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock size={12} className="text-rdio-secondary" />
                  <span className="caption text-rdio-secondary">
                    {activity.timestamp}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}