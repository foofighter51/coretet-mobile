import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

interface TopNavBarProps {
  title: string;
  onBack?: () => void;
  rightActions?: ReactNode;
  showBackButton?: boolean;
}

export function TopNavBar({ 
  title, 
  onBack, 
  rightActions, 
  showBackButton = false 
}: TopNavBarProps) {
  return (
    <header 
      className="bg-white sticky top-0 z-20"
      style={{ 
        height: '88px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e1e4e8',
        boxShadow: '0px 2px 6px rgba(0,0,0,0.08)'
      }}
    >
      <div 
        className="flex items-center justify-between px-4"
        style={{ 
          height: '44px',
          paddingTop: '44px'
        }}
      >
        {/* Left Side - Back Button */}
        <div className="flex items-center" style={{ width: '60px' }}>
          {showBackButton && onBack && (
            <button 
              onClick={onBack}
              className="flex items-center justify-center"
              style={{ 
                width: '44px',
                height: '44px',
                color: '#0088cc'
              }}
            >
              <ArrowLeft size={24} />
            </button>
          )}
        </div>

        {/* Center - Title */}
        <div className="flex-1 flex justify-center">
          <h1 
            className="truncate text-center"
            style={{ 
              fontSize: '20px',
              fontWeight: '600',
              lineHeight: '24px',
              color: '#1e252b',
              maxWidth: '200px'
            }}
          >
            {title}
          </h1>
        </div>

        {/* Right Side - Actions */}
        <div 
          className="flex items-center justify-end gap-2"
          style={{ width: '60px' }}
        >
          {rightActions && (
            <div className="flex items-center gap-2">
              {rightActions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}