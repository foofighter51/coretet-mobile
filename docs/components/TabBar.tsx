import { Users, Disc, PlusSquare, Music, User } from "lucide-react";

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'bands', icon: Users, label: 'Bands' },
  { id: 'tracks', icon: Disc, label: 'Tracks' },
  { id: 'add', icon: PlusSquare, label: 'Add' },
  { id: 'playlists', icon: Music, label: 'Playlists' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div 
      className="bg-white w-mobile"
      style={{ 
        height: '83px',
        borderTop: '1px solid #e1e4e8',
        boxShadow: '0px -2px 4px rgba(0,0,0,0.05)',
        backgroundColor: '#ffffff'
      }}
    >
      <div 
        className="flex items-center h-full"
        style={{ height: '49px', paddingTop: '44px' }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 flex flex-col items-center justify-center relative"
              style={{ height: '49px' }}
            >
              <div className="relative mb-1">
                <Icon 
                  size={24} 
                  className="transition-colors"
                  style={{ 
                    width: '24px',
                    height: '24px',
                    color: isActive ? '#0088cc' : '#9da7b0'
                  }}
                />
              </div>
              
              <span 
                className="transition-colors"
                style={{ 
                  fontSize: '10px',
                  fontWeight: '500',
                  lineHeight: '12px',
                  color: isActive ? '#0088cc' : '#9da7b0'
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}