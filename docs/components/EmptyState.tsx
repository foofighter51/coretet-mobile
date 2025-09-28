import { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ""
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}>
      {/* Centered Icon - Outline style in blue */}
      <div className="mb-6">
        <div className="w-20 h-20 rounded-full border-2 border-rdio-primary flex items-center justify-center bg-white">
          <Icon size={32} className="text-rdio-primary" strokeWidth={1.5} />
        </div>
      </div>

      {/* Friendly Message */}
      <h3 
        className="mb-3 text-text-primary"
        style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          lineHeight: '1.4' 
        }}
      >
        {title}
      </h3>

      {/* Helpful Description */}
      <p 
        className="mb-8 text-rdio-secondary max-w-sm"
        style={{ 
          fontSize: '14px', 
          fontWeight: '400', 
          lineHeight: '1.5' 
        }}
      >
        {description}
      </p>

      {/* Primary Action Button */}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-rdio-primary hover:bg-primary-hover text-white px-6 py-3"
          style={{ borderRadius: '20px', fontSize: '16px', fontWeight: '500' }}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}