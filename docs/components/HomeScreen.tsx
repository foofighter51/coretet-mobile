import { Plus, Users } from "lucide-react";
import { ScreenTemplate, ScreenSection } from "./ScreenTemplate";
import { EnsembleGridView } from "./ListView";
import { EnsembleCard } from "./EnsembleCard";

interface HomeScreenProps {
  userName?: string;
  onEnsembleClick?: (bandId: string, bandName: string, memberCount: number) => void;
  onShowInvites?: () => void;
  ensembles?: typeof mockBands;
}

const mockBands = [
  {
    id: '1',
    name: 'Summer Indie Band',
    memberCount: 4,
    trackCount: 8,
    lastActivity: '2 hours ago',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMG11c2ljJTIwYmFuZHxlbnwxfHx8fDE3NTg1NTU2ODN8MA&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: '2',
    name: 'Electronic Fusion Band',
    memberCount: 3,
    trackCount: 12,
    lastActivity: '1 day ago',
  },
  {
    id: '3',
    name: 'Jazz Experiments',
    memberCount: 5,
    trackCount: 6,
    lastActivity: '3 days ago',
    coverImage: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXp6JTIwbXVzaWNpYW58ZW58MXx8fHwxNzU4NTU1NjgzfDA&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: '4',
    name: 'Acoustic Sessions',
    memberCount: 2,
    trackCount: 15,
    lastActivity: '1 week ago',
  },
  {
    id: '5',
    name: 'Rock Revival Band',
    memberCount: 6,
    trackCount: 10,
    lastActivity: '2 weeks ago',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2NrJTIwYmFuZHxlbnwxfHx8fDE3NTg1NTU2ODN8MA&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    id: '6',
    name: 'Lo-Fi Beats Band',
    memberCount: 7,
    trackCount: 22,
    lastActivity: '3 weeks ago',
  }
];

export function HomeScreen({ userName = 'Alex', onEnsembleClick, onShowInvites, ensembles = mockBands }: HomeScreenProps) {
  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <ScreenTemplate
      navigationTitle="Bands"
      rightAction={
        <button 
          className="flex items-center justify-center"
          style={{ 
            width: '44px',
            height: '44px',
            color: '#586069'
          }}
        >
          <Plus size={24} />
        </button>
      }
      showTabBar={false}
    >
      {/* Welcome Message Section */}
      <ScreenSection>
        <div>
          <h2 
            className="text-text-primary mb-1"
            style={{ 
              fontSize: '28px',
              fontWeight: '600',
              lineHeight: '1.3'
            }}
          >
            Good morning, {userName}
          </h2>
          <p 
            className="text-rdio-secondary"
            style={{ 
              fontSize: '16px',
              fontWeight: '400',
              lineHeight: '1.5'
            }}
          >
            {currentDate}
          </p>
        </div>
      </ScreenSection>

      {/* Standardized Band Grid */}
      <EnsembleGridView
        ensembles={ensembles.map((band) => (
          <EnsembleCard
            key={band.id}
            id={band.id}
            name={band.name}
            memberCount={band.memberCount}
            trackCount={band.trackCount}
            lastActivity={band.lastActivity}
            coverImage={band.coverImage}
            onClick={onEnsembleClick}
          />
        ))}
        emptyState={{
          icon: Users,
          title: "No bands yet",
          description: "Form your first band to start collaborating with musicians and making music together.",
          actionLabel: "Form a Band",
          onAction: onShowInvites
        }}
      />

      {/* Floating Action Button */}
      <button 
        onClick={onShowInvites}
        className="fixed bg-rdio-primary text-white shadow-play-button flex items-center justify-center transition-all duration-200 hover:bg-primary-hover active:scale-95"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          bottom: '100px',
          right: '24px',
          zIndex: 10
        }}
      >
        <Plus size={24} />
      </button>
    </ScreenTemplate>
  );
}