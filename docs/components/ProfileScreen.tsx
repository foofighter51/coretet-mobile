import { useState } from "react";
import { 
  ChevronRight, 
  Edit3, 
  Bell, 
  HardDrive, 
  UserPlus, 
  HelpCircle, 
  LogOut,
  Settings,
  Users,
  ChevronDown
} from "lucide-react";
import { ScreenTemplate, ScreenSection } from "./ScreenTemplate";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";

interface StorageInfo {
  used: number; // in GB
  total: number; // in GB
}

interface ProfileScreenProps {
  userName?: string;
  phoneNumber?: string;
  userInitials?: string;
  currentBand?: string;
  storageInfo?: StorageInfo;
}

const defaultStorage: StorageInfo = {
  used: 12.4,
  total: 50.0
};

const mockBands = [
  "Summer Indie Band",
  "Electronic Fusion Band", 
  "Jazz Experiments",
  "Acoustic Sessions",
  "Rock Revival Band"
];

export function ProfileScreen({
  userName = "Alex Chen",
  phoneNumber = "+1 (555) 123-4567",
  userInitials = "AC",
  currentBand = "Summer Indie Band",
  storageInfo = defaultStorage
}: ProfileScreenProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [selectedBand, setSelectedBand] = useState(currentBand);
  const [showBandSelector, setShowBandSelector] = useState(false);

  const storagePercentage = (storageInfo.used / storageInfo.total) * 100;

  const handleSignOut = () => {
    setIsSigningOut(true);
    // Simulate sign out process
    setTimeout(() => {
      setIsSigningOut(false);
      console.log('User signed out');
    }, 1500);
  };

  const handleBandSwitch = (bandName: string) => {
    setSelectedBand(bandName);
    setShowBandSelector(false);
    console.log('Switched to band:', bandName);
  };

  const settingsItems = [
    {
      id: 'edit-profile',
      icon: Edit3,
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      onClick: () => console.log('Edit Profile clicked'),
      showChevron: true
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notification Preferences',
      subtitle: 'Manage your notification settings',
      onClick: () => console.log('Notifications clicked'),
      showChevron: true
    },
    {
      id: 'storage',
      icon: HardDrive,
      title: 'Storage Usage',
      subtitle: `${storageInfo.used} GB of ${storageInfo.total} GB used`,
      onClick: () => console.log('Storage clicked'),
      showChevron: true,
      showProgress: true
    },
    {
      id: 'invite',
      icon: UserPlus,
      title: 'Invite Friends',
      subtitle: 'Share CoreTet with others',
      onClick: () => console.log('Invite Friends clicked'),
      showChevron: true
    },
    {
      id: 'help',
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onClick: () => console.log('Help clicked'),
      showChevron: true
    }
  ];

  return (
    <ScreenTemplate
      navigationTitle="Profile"
      rightAction={
        <button 
          className="flex items-center justify-center"
          style={{ 
            width: '44px',
            height: '44px',
            color: '#586069'
          }}
        >
          <Settings size={24} />
        </button>
      }
      showTabBar={false}
    >
      {/* User Info Section */}
      <ScreenSection>
        <div className="text-center">
          {/* Avatar */}
          <div 
            className="w-30 h-30 bg-rdio-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-card"
            style={{ width: '120px', height: '120px' }}
          >
            <span 
              className="text-white font-medium"
              style={{ fontSize: '36px' }}
            >
              {userInitials}
            </span>
          </div>
          
          {/* User Details */}
          <h2 
            className="mb-2"
            style={{ 
              fontSize: '24px', 
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}
          >
            {userName}
          </h2>
          <p className="text-rdio-secondary">
            {phoneNumber}
          </p>
        </div>
      </ScreenSection>

      {/* Current Band Section */}
      <ScreenSection>
        <Card className="bg-white rounded-lg shadow-subtle overflow-hidden">
          <button
            onClick={() => setShowBandSelector(!showBandSelector)}
            className="w-full p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-rdio-primary rounded-lg flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="mb-1">Current Band</h4>
              <p className="caption text-rdio-secondary">
                {selectedBand}
              </p>
            </div>
            
            <ChevronDown 
              size={20} 
              className={`text-rdio-secondary transition-transform ${
                showBandSelector ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {/* Band Selector Dropdown */}
          {showBandSelector && (
            <div className="border-t border-gray-100">
              {mockBands.map((band, index) => (
                <button
                  key={band}
                  onClick={() => handleBandSwitch(band)}
                  className={`w-full p-4 pl-20 text-left hover:bg-gray-50 transition-colors ${
                    band === selectedBand ? 'bg-blue-50 text-rdio-primary' : ''
                  }`}
                >
                  <p className="text-sm">{band}</p>
                </button>
              ))}
            </div>
          )}
        </Card>
      </ScreenSection>

      {/* Settings List Section */}
      <ScreenSection>
        <div className="space-y-1">
          {settingsItems.map((item, index) => (
            <Card key={item.id} className="bg-white rounded-lg shadow-subtle overflow-hidden">
              <button
                onClick={item.onClick}
                className="w-full p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <item.icon size={20} className="text-rdio-secondary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="mb-1">{item.title}</h4>
                  <p className="caption text-rdio-secondary">
                    {item.subtitle}
                  </p>
                  
                  {/* Storage Progress Bar */}
                  {item.showProgress && (
                    <div className="mt-3">
                      <Progress 
                        value={storagePercentage} 
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
                
                {item.showChevron && (
                  <ChevronRight size={20} className="text-rdio-secondary" />
                )}
              </button>
              
              {/* Separator between items */}
              {index < settingsItems.length - 1 && (
                <Separator className="ml-20" />
              )}
            </Card>
          ))}
          
          {/* Sign Out - Separate Card */}
          <Card className="bg-white rounded-lg shadow-subtle overflow-hidden mt-6">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full p-6 flex items-center gap-4 hover:bg-red-50 transition-colors text-left disabled:opacity-50"
            >
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <LogOut size={20} className="text-red-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-red-600">
                  {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                </h4>
                <p className="caption text-red-400">
                  Sign out of your account
                </p>
              </div>
              
              <ChevronRight size={20} className="text-red-400" />
            </button>
          </Card>
        </div>
      </ScreenSection>

      {/* Version Info Section */}
      <ScreenSection>
        <div className="text-center">
          <p className="caption text-rdio-secondary">
            CoreTet v2.1.4
          </p>
        </div>
      </ScreenSection>
    </ScreenTemplate>
  );
}