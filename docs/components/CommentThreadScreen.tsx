import { useState, useRef, useEffect } from "react";
import { 
  Play, 
  Pause, 
  ArrowLeft, 
  Reply, 
  MessageCircle,
  Send,
  X
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar } from "./ui/avatar";
import { EmptyState } from "./EmptyState";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  timestamp: number; // Position in seconds on the track
  createdAt: string;
  replies?: Comment[];
}

interface Track {
  title: string;
  albumArt?: string;
  duration: number; // in seconds
}

interface CommentThreadScreenProps {
  isOpen: boolean;
  onClose: () => void;
  track?: Track;
  isPlaying?: boolean;
  currentTime?: number;
  onPlayPause?: () => void;
  comments?: Comment[];
  onAddComment?: (content: string, timestamp: number, replyToId?: string) => void;
}

const mockComments: Comment[] = [
  {
    id: '1',
    userId: 'user1',
    username: 'Sarah Martinez',
    avatar: 'SM',
    content: 'Love the guitar solo here! The reverb effect is perfect.',
    timestamp: 45,
    createdAt: '2 hours ago',
    replies: [
      {
        id: '1a',
        userId: 'user2',
        username: 'Mike Douglas',
        avatar: 'MD',
        content: 'Thanks! Used a vintage spring reverb plugin for that warm sound.',
        timestamp: 45,
        createdAt: '1 hour ago'
      },
      {
        id: '1b',
        userId: 'user3',
        username: 'Alex Chen',
        avatar: 'AC',
        content: 'The whole arrangement is incredible. Great work everyone!',
        timestamp: 45,
        createdAt: '45 minutes ago'
      }
    ]
  },
  {
    id: '2',
    userId: 'user4',
    username: 'Lisa Kim',
    avatar: 'LK',
    content: 'This transition needs work. Maybe fade the drums earlier?',
    timestamp: 128,
    createdAt: '3 hours ago',
    replies: [
      {
        id: '2a',
        userId: 'user1',
        username: 'Sarah Martinez',
        avatar: 'SM',
        content: 'Good catch! I can adjust the drum arrangement.',
        timestamp: 128,
        createdAt: '2 hours ago'
      }
    ]
  },
  {
    id: '3',
    userId: 'user5',
    username: 'David Park',
    avatar: 'DP',
    content: 'Brilliant bass line! Really drives the whole track forward.',
    timestamp: 76,
    createdAt: '4 hours ago'
  },
  {
    id: '4',
    userId: 'user2',
    username: 'Mike Douglas',
    avatar: 'MD',
    content: 'Should we add more vocals in the bridge section?',
    timestamp: 156,
    createdAt: '1 day ago',
    replies: [
      {
        id: '4a',
        userId: 'user1',
        username: 'Sarah Martinez',
        avatar: 'SM',
        content: 'Yes! I have some harmony ideas. Let me record them.',
        timestamp: 156,
        createdAt: '23 hours ago'
      }
    ]
  },
  {
    id: '5',
    userId: 'user6',
    username: 'Emma Rodriguez',
    avatar: 'ER',
    content: 'The outro is perfect as is. Don\'t change a thing!',
    timestamp: 198,
    createdAt: '2 days ago'
  }
];

const mockUsers = [
  { id: 'user1', username: 'Sarah Martinez', avatar: 'SM' },
  { id: 'user2', username: 'Mike Douglas', avatar: 'MD' },
  { id: 'user3', username: 'Alex Chen', avatar: 'AC' },
  { id: 'user4', username: 'Lisa Kim', avatar: 'LK' },
  { id: 'user5', username: 'David Park', avatar: 'DP' },
  { id: 'user6', username: 'Emma Rodriguez', avatar: 'ER' },
];

export function CommentThreadScreen({
  isOpen,
  onClose,
  track,
  isPlaying = false,
  currentTime = 0,
  onPlayPause,
  comments = mockComments,
  onAddComment
}: CommentThreadScreenProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionUsers, setMentionUsers] = useState(mockUsers);
  const inputRef = useRef<HTMLInputElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Filter users for @ mentions
  useEffect(() => {
    if (mentionQuery) {
      const filtered = mockUsers.filter(user => 
        user.username.toLowerCase().includes(mentionQuery.toLowerCase())
      );
      setMentionUsers(filtered);
      setShowMentions(filtered.length > 0);
    } else {
      setShowMentions(false);
    }
  }, [mentionQuery]);

  // Handle @ mention detection
  const handleInputChange = (value: string) => {
    setNewComment(value);
    
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setMentionQuery('');
      setShowMentions(true);
    } else if (lastAtIndex !== -1) {
      const mentionText = value.slice(lastAtIndex + 1);
      if (!mentionText.includes(' ')) {
        setMentionQuery(mentionText);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (user: typeof mockUsers[0]) => {
    const lastAtIndex = newComment.lastIndexOf('@');
    const beforeMention = newComment.slice(0, lastAtIndex);
    const newValue = beforeMention + `@${user.username} `;
    setNewComment(newValue);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const handleSubmitComment = () => {
    if (newComment.trim() && track) {
      onAddComment?.(newComment.trim(), currentTime, replyingTo || undefined);
      setNewComment('');
      setReplyingTo(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimelinePosition = (timestamp: number) => {
    if (!track) return 0;
    return (timestamp / track.duration) * 100;
  };

  const getCurrentTimelinePosition = () => {
    if (!track) return 0;
    return (currentTime / track.duration) * 100;
  };

  // Group comments by timestamp for timeline
  const commentsByTimestamp = comments.reduce((acc, comment) => {
    const key = comment.timestamp;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(comment);
    return acc;
  }, {} as Record<number, Comment[]>);

  if (!isOpen || !track) return null;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-off-white z-50 flex flex-col"
    >
      {/* Mini Player Bar */}
      <div 
        className="bg-white sticky top-0 z-20"
        style={{ 
          height: '88px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e1e4e8',
          boxShadow: '0px 2px 6px rgba(0,0,0,0.08)'
        }}
      >
        <div 
          className="flex items-center gap-4 px-4"
          style={{ 
            height: '44px',
            paddingTop: '44px'
          }}
        >
          <button
            onClick={onClose}
            className="flex items-center justify-center"
            style={{ 
              width: '44px',
              height: '44px',
              color: '#0088cc'
            }}
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="flex items-center gap-3 flex-1">
            {track.albumArt ? (
              <img
                src={track.albumArt}
                alt={track.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <MessageCircle size={20} className="text-rdio-secondary" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="truncate" style={{ fontSize: '18px', fontWeight: '600' }}>
                {track.title}
              </h3>
            </div>
            
            <Button
              variant="primary"
              size="icon"
              onClick={onPlayPause}
              className="w-10 h-10 rounded-full p-0"
            >
              {isPlaying ? (
                <Pause size={16} />
              ) : (
                <Play size={16} />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="mb-2 flex justify-between items-center">
          <span className="caption text-rdio-secondary">Timeline</span>
          <span className="caption text-rdio-secondary">
            {formatTime(currentTime)} / {formatTime(track.duration)}
          </span>
        </div>
        
        <div
          ref={timelineRef}
          className="relative h-6 bg-gray-100 rounded-full overflow-hidden"
        >
          {/* Progress bar */}
          <div
            className="absolute top-0 left-0 h-full bg-rdio-primary rounded-full transition-all duration-100"
            style={{ width: `${getCurrentTimelinePosition()}%` }}
          />
          
          {/* Comment dots */}
          {Object.entries(commentsByTimestamp).map(([timestamp, commentsAtTime]) => (
            <div
              key={timestamp}
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-coral rounded-full border-2 border-white shadow-sm cursor-pointer hover:scale-125 transition-transform"
              style={{ left: `${getTimelinePosition(Number(timestamp))}%` }}
              title={`${commentsAtTime.length} comment${commentsAtTime.length !== 1 ? 's' : ''} at ${formatTime(Number(timestamp))}`}
            />
          ))}
          
          {/* Current time indicator */}
          <div
            className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-rdio-primary rounded-full shadow-sm"
            style={{ left: `${getCurrentTimelinePosition()}%` }}
          />
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <AnimatePresence>
          {comments
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Main Comment */}
                <div className="bg-white rounded-lg shadow-subtle p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 bg-rdio-primary text-white flex items-center justify-center text-sm font-medium">
                      {comment.avatar}
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">
                          {comment.username}
                        </span>
                        <span className="caption text-rdio-secondary">
                          {formatTime(comment.timestamp)}
                        </span>
                        <span className="caption text-rdio-secondary">
                          •
                        </span>
                        <span className="caption text-rdio-secondary">
                          {comment.createdAt}
                        </span>
                      </div>
                      
                      <p className="text-sm mb-3 leading-relaxed">
                        {comment.content}
                      </p>
                      
                      <Button
                        onClick={() => setReplyingTo(comment.id)}
                        variant="ghost"
                        size="small"
                        className="text-rdio-primary hover:bg-blue-50"
                      >
                        <Reply size={14} className="mr-1" />
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-8 space-y-3 border-l-2 border-gray-200 pl-4">
                    {comment.replies.map((reply) => (
                      <motion.div
                        key={reply.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-lg shadow-subtle p-4"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-8 h-8 bg-accent-teal text-white flex items-center justify-center text-sm font-medium">
                            {reply.avatar}
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-sm">
                                {reply.username}
                              </span>
                              <span className="caption text-rdio-secondary">
                                {reply.createdAt}
                              </span>
                            </div>
                            
                            <p className="text-sm leading-relaxed">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <EmptyState
            icon={MessageCircle}
            title="Be the first to comment"
            description="Tap anywhere on the timeline above to add feedback and start the conversation with your bandmates."
            className="py-12"
          />
        )}
      </div>

      {/* Floating Comment Input */}
      <div className="bg-white border-t border-gray-200 p-4 relative">
        {/* @ Mention Dropdown */}
        <AnimatePresence>
          {showMentions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-4 right-4 bg-white rounded-lg shadow-card border border-gray-200 max-h-40 overflow-y-auto mb-2"
            >
              {mentionUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleMentionSelect(user)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg text-left"
                >
                  <Avatar className="w-6 h-6 bg-rdio-primary text-white flex items-center justify-center text-xs font-medium">
                    {user.avatar}
                  </Avatar>
                  <span className="text-sm font-medium">
                    @{user.username}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reply indicator */}
        {replyingTo && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 rounded-lg">
            <Reply size={14} className="text-rdio-primary" />
            <span className="text-sm text-rdio-primary flex-1">
              Replying to {comments.find(c => c.id === replyingTo)?.username}
            </span>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 hover:bg-blue-100 rounded"
            >
              <X size={12} className="text-rdio-primary" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newComment}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Add a comment at ${formatTime(currentTime)}...`}
              className="pr-12 rounded-full"
            />
            
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="caption text-rdio-secondary bg-gray-100 px-2 py-1 rounded">
                {formatTime(currentTime)}
              </span>
            </div>
          </div>
          
          <Button
            variant="primary"
            size="icon"
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
            className="rounded-full w-10 h-10 p-0 disabled:bg-gray-300"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}