import React, { useState } from 'react';
import { Play, Heart, ThumbsUp, Plus, Search, Filter, Users, Music } from 'lucide-react';

interface BandCardProps {
  title: string;
  memberCount: number;
  trackCount: number;
  lastActivity: string;
  image?: string;
}

function BandCard({ title, memberCount, trackCount, lastActivity, image }: BandCardProps) {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '0',
      marginBottom: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {image && (
        <img
          src={image}
          alt={title}
          style={{
            width: '100%',
            height: '120px',
            objectFit: 'cover'
          }}
        />
      )}
      <div style={{ padding: '12px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          margin: '0 0 4px 0',
          color: '#1a1a1a'
        }}>
          {title}
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          color: '#666666'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={14} />
            {memberCount}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Music size={14} />
            {trackCount}
          </span>
        </div>
        <p style={{
          fontSize: '12px',
          color: '#999999',
          margin: '4px 0 0 0'
        }}>
          {lastActivity}
        </p>
      </div>
    </div>
  );
}

interface TrackRowProps {
  title: string;
  duration: string;
  rating?: 'like' | 'love' | 'none';
  isPlaying?: boolean;
  onPlay?: () => void;
}

function TrackRow({ title, duration, rating = 'none', isPlaying = false, onPlay }: TrackRowProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #f0f0f0',
      gap: '12px'
    }}>
      <button
        onClick={onPlay}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: isPlaying ? '#007AFF' : '#f8f9fa',
          color: isPlaying ? 'white' : '#007AFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        <Play size={16} fill={isPlaying ? 'white' : '#007AFF'} />
      </button>

      <div style={{ flex: 1 }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '500',
          margin: '0',
          color: '#1a1a1a'
        }}>
          {title}
        </h4>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {rating === 'like' && <ThumbsUp size={16} color="#007AFF" />}
        {rating === 'love' && <Heart size={16} color="#FF3B30" fill="#FF3B30" />}
        <span style={{
          fontSize: '14px',
          color: '#999999',
          minWidth: '40px',
          textAlign: 'right'
        }}>
          {duration}
        </span>
      </div>
    </div>
  );
}

function TabBar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  const tabs = [
    { id: 'bands', label: 'Bands', icon: Users },
    { id: 'tracks', label: 'Tracks', icon: Music },
    { id: 'add', label: 'Add', icon: Plus },
    { id: 'playlists', label: 'Playlists', icon: Music },
    { id: 'profile', label: 'Profile', icon: Users }
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '375px',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e5e5e5',
      padding: '8px 0',
      zIndex: 1000
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center'
      }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                color: isActive ? '#007AFF' : '#999999'
              }}
            >
              <Icon size={20} />
              <span style={{
                fontSize: '10px',
                fontWeight: isActive ? '600' : '400'
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CoreTetFigmaApp() {
  const [activeTab, setActiveTab] = useState('bands');
  const [currentScreen, setCurrentScreen] = useState('welcome'); // welcome, phone, verify, main
  const [phoneNumber, setPhoneNumber] = useState('');
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);

  // Welcome Screen
  if (currentScreen === 'welcome') {
    return (
      <div style={{
        width: '375px',
        height: '812px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Logo */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '60px',
          backgroundColor: '#007AFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '60px'
        }}>
          <span style={{
            fontSize: '48px',
            fontWeight: '600',
            color: 'white'
          }}>
            CT
          </span>
        </div>

        {/* Welcome Text */}
        <h1 style={{
          fontSize: '40px',
          fontWeight: '300',
          textAlign: 'center',
          margin: '0 0 24px 0',
          color: '#1a1a1a',
          lineHeight: '1.2'
        }}>
          Welcome to CoreTet
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#666666',
          textAlign: 'center',
          margin: '0 0 12px 0',
          fontWeight: '400'
        }}>
          Collaboration for Bands
        </p>

        <p style={{
          fontSize: '16px',
          color: '#999999',
          textAlign: 'center',
          margin: '0 0 80px 0',
          fontStyle: 'italic'
        }}>
          So easy, a drummer can do it
        </p>

        {/* Get Started Button */}
        <button
          onClick={() => setCurrentScreen('phone')}
          style={{
            width: '100%',
            height: '56px',
            borderRadius: '28px',
            border: 'none',
            backgroundColor: '#007AFF',
            color: 'white',
            fontSize: '18px',
            fontWeight: '600',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          GET STARTED
        </button>
      </div>
    );
  }

  // Phone Number Screen
  if (currentScreen === 'phone') {
    return (
      <div style={{
        width: '375px',
        height: '812px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        padding: '60px 40px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '400',
          textAlign: 'center',
          margin: '0 0 60px 0',
          color: '#1a1a1a',
          lineHeight: '1.3'
        }}>
          Enter your phone number
        </h1>

        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px'
          }}>
            {/* Country Code */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px',
              border: '2px solid #e5e5e5',
              borderRadius: '12px',
              backgroundColor: '#ffffff'
            }}>
              <span>🇺🇸</span>
              <span style={{ fontSize: '16px', color: '#1a1a1a' }}>+1</span>
              <span style={{ color: '#999999' }}>▾</span>
            </div>

            {/* Phone Input */}
            <input
              type="tel"
              placeholder="(555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              style={{
                flex: 1,
                padding: '16px',
                border: phoneNumber ? '2px solid #007AFF' : '2px solid #e5e5e5',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            />
          </div>
        </div>

        <p style={{
          fontSize: '16px',
          color: '#666666',
          textAlign: 'center',
          margin: '0 0 100px 0'
        }}>
          We'll text you a verification code
        </p>

        {/* Continue Button */}
        <button
          onClick={() => setCurrentScreen('main')}
          style={{
            width: '100%',
            height: '56px',
            borderRadius: '28px',
            border: 'none',
            backgroundColor: phoneNumber ? '#007AFF' : '#cccccc',
            color: 'white',
            fontSize: '18px',
            fontWeight: '600',
            cursor: phoneNumber ? 'pointer' : 'not-allowed',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            position: 'fixed',
            bottom: '40px',
            left: '40px',
            right: '40px',
            maxWidth: '295px'
          }}
        >
          CONTINUE
        </button>
      </div>
    );
  }

  // Main App
  return (
    <div style={{
      width: '375px',
      height: '812px',
      margin: '0 auto',
      backgroundColor: '#f8f9fa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e5e5',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: '600',
          margin: '0',
          color: '#1a1a1a'
        }}>
          {activeTab === 'bands' ? 'Bands' :
           activeTab === 'tracks' ? 'Tracks' :
           activeTab === 'playlists' ? 'Playlists' : 'Profile'}
        </h1>
        <button style={{
          width: '32px',
          height: '32px',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer'
        }}>
          <Plus size={24} color="#1a1a1a" />
        </button>
      </div>

      {/* Content */}
      <div style={{
        padding: '20px',
        height: 'calc(100vh - 120px)',
        overflow: 'auto',
        paddingBottom: '80px'
      }}>
        {/* Bands Tab */}
        {activeTab === 'bands' && (
          <>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '600',
                margin: '0 0 4px 0',
                color: '#1a1a1a'
              }}>
                Good morning, Eric
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#666666',
                margin: '0'
              }}>
                Thursday, September 25, 2025
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              <BandCard
                title="Summer Indie"
                memberCount={4}
                trackCount={8}
                lastActivity="2 hours ago"
                image="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300"
              />
              <BandCard
                title="Electronic Fusion"
                memberCount={3}
                trackCount={12}
                lastActivity="1 day ago"
              />
              <BandCard
                title="Jazz Experiments"
                memberCount={5}
                trackCount={6}
                lastActivity="3 days ago"
                image="https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=300"
              />
              <BandCard
                title="Acoustic Sessions"
                memberCount={2}
                trackCount={15}
                lastActivity="1 week ago"
              />
              <BandCard
                title="Rock Revival Band"
                memberCount={6}
                trackCount={10}
                lastActivity="2 weeks ago"
                image="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300"
              />
              <BandCard
                title="Lo-Fi Beats Band"
                memberCount={7}
                trackCount={22}
                lastActivity="3 weeks ago"
              />
            </div>
          </>
        )}

        {/* Tracks Tab */}
        {activeTab === 'tracks' && (
          <>
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <div style={{
                flex: 1,
                position: 'relative'
              }}>
                <Search
                  size={20}
                  color="#999999"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                />
                <input
                  placeholder="Search tracks, collaborators..."
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 44px',
                    border: '2px solid #e5e5e5',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>
              <button style={{
                padding: '12px 20px',
                border: '2px solid #007AFF',
                borderRadius: '20px',
                backgroundColor: '#ffffff',
                color: '#007AFF',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Filter size={16} />
                FILTER
              </button>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  margin: '0',
                  color: '#1a1a1a'
                }}>
                  Your Tracks
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: '#666666',
                  margin: '0'
                }}>
                  5 tracks
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  padding: '8px 16px',
                  border: '2px solid #007AFF',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  color: '#007AFF',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  CONNECTION ERROR
                </button>
                <button style={{
                  padding: '8px 16px',
                  border: '2px solid #007AFF',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  color: '#007AFF',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  UPLOAD ERROR
                </button>
              </div>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '0 16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <TrackRow
                title="Summer Nights"
                duration="3:42"
                rating="like"
                isPlaying={playingTrack === 'Summer Nights'}
                onPlay={() => setPlayingTrack(playingTrack === 'Summer Nights' ? null : 'Summer Nights')}
              />
              <TrackRow
                title="Digital Dreams"
                duration="4:15"
                rating="love"
                isPlaying={playingTrack === 'Digital Dreams'}
                onPlay={() => setPlayingTrack(playingTrack === 'Digital Dreams' ? null : 'Digital Dreams')}
              />
              <TrackRow
                title="Midnight Jazz"
                duration="5:28"
                isPlaying={playingTrack === 'Midnight Jazz'}
                onPlay={() => setPlayingTrack(playingTrack === 'Midnight Jazz' ? null : 'Midnight Jazz')}
              />
              <TrackRow
                title="Electric Pulse"
                duration="3:20"
                isPlaying={playingTrack === 'Electric Pulse'}
                onPlay={() => setPlayingTrack(playingTrack === 'Electric Pulse' ? null : 'Electric Pulse')}
              />
              <TrackRow
                title="Acoustic Memories"
                duration="4:03"
                rating="like"
                isPlaying={playingTrack === 'Acoustic Memories'}
                onPlay={() => setPlayingTrack(playingTrack === 'Acoustic Memories' ? null : 'Acoustic Memories')}
              />
            </div>
          </>
        )}

        {/* Playlists Tab */}
        {activeTab === 'playlists' && (
          <>
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <div style={{
                flex: 1,
                position: 'relative'
              }}>
                <Search
                  size={20}
                  color="#999999"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                />
                <input
                  placeholder="Search tracks, collaborators..."
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 44px',
                    border: '2px solid #e5e5e5',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>
              <button style={{
                padding: '12px 20px',
                border: '2px solid #007AFF',
                borderRadius: '20px',
                backgroundColor: '#ffffff',
                color: '#007AFF',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Filter size={16} />
                FILTER
              </button>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '60px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                margin: '0',
                color: '#1a1a1a'
              }}>
                Band Playlists
              </h2>
              <span style={{
                fontSize: '16px',
                color: '#666666'
              }}>
                Shared
              </span>
            </div>

            {/* Empty State */}
            <div style={{
              textAlign: 'center',
              padding: '60px 20px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '40px',
                border: '3px solid #e5e5e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto'
              }}>
                <Music size={32} color="#007AFF" />
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                margin: '0 0 16px 0',
                color: '#1a1a1a'
              }}>
                No playlists yet
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#666666',
                margin: '0 0 40px 0',
                lineHeight: '1.5'
              }}>
                Create playlists to organize tracks and share them with your bandmates.
              </p>
              <button style={{
                padding: '16px 32px',
                border: 'none',
                borderRadius: '28px',
                backgroundColor: '#007AFF',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                CREATE PLAYLIST
              </button>
            </div>
          </>
        )}
      </div>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}