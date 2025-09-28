import { useState } from 'react';
import { ArrowLeft, Users, UserPlus, MoreVertical } from 'lucide-react';
import { ScreenTemplate, ScreenSection } from './ScreenTemplate';
import { MemberListView } from './ListView';
import { Button } from './ui/button';

interface Member {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  joinedDate: string;
  isOwner?: boolean;
}

interface MemberManagementScreenProps {
  ensembleName: string;
  members: Member[];
  onBack: () => void;
  onInviteMembers: () => void;
  onMemberClick: (memberId: string) => void;
  onMemberAction: (memberId: string, action: 'remove' | 'promote' | 'demote') => void;
}

const mockMembers: Member[] = [
  {
    id: '1',
    name: 'Sarah Martinez',
    role: 'Owner',
    status: 'online',
    joinedDate: '2023-01-15',
    isOwner: true
  },
  {
    id: '2',
    name: 'Mike Douglas',
    role: 'Producer',
    status: 'away',
    joinedDate: '2023-02-20'
  },
  {
    id: '3',
    name: 'Lisa Kim',
    role: 'Vocalist',
    status: 'online',
    joinedDate: '2023-03-10'
  },
  {
    id: '4',
    name: 'Alex Chen',
    role: 'Guitarist',
    status: 'offline',
    joinedDate: '2023-03-25'
  },
  {
    id: '5',
    name: 'Emma Rodriguez',
    role: 'Bassist',
    status: 'online',
    joinedDate: '2023-04-05'
  }
];

export function MemberManagementScreen({
  ensembleName,
  members = mockMembers,
  onBack,
  onInviteMembers,
  onMemberClick,
  onMemberAction
}: MemberManagementScreenProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <ScreenTemplate
      navigationTitle="Members"
      leftAction={
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
      }
      rightAction={
        <button 
          onClick={onInviteMembers}
          className="flex items-center justify-center"
          style={{ 
            width: '44px',
            height: '44px',
            color: '#0088cc'
          }}
        >
          <UserPlus size={24} />
        </button>
      }
      showTabBar={false}
    >
      {/* Ensemble Info Section */}
      <ScreenSection>
        <div className="text-center">
          <h2 className="mb-1">{ensembleName}</h2>
          <p className="text-rdio-secondary">
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </p>
        </div>
      </ScreenSection>

      {/* Member List */}
      <MemberListView
        members={members.map(member => ({
          id: member.id,
          name: member.name,
          role: member.role,
          status: member.status,
          onClick: () => onMemberClick(member.id)
        }))}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        emptyState={{
          icon: Users,
          title: "No members yet",
          description: "Invite musicians to join your ensemble and start collaborating on music together.",
          actionLabel: "Invite Members",
          onAction: onInviteMembers
        }}
      />

      {/* Invite Button - Fixed at bottom */}
      <div 
        className="fixed bottom-0 left-1/2 transform -translate-x-1/2 p-4"
        style={{ 
          width: 'var(--mobile-width)',
          background: 'linear-gradient(transparent, rgba(250, 251, 252, 0.9), #fafbfc)',
          paddingBottom: '24px'
        }}
      >
        <Button
          variant="primary"
          onClick={onInviteMembers}
          className="w-full"
        >
          <UserPlus size={16} className="mr-2" />
          Invite Members
        </Button>
      </div>
    </ScreenTemplate>
  );
}