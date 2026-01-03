import React, { useState } from 'react';
import { Music, MessageSquare, Lock, Upload, Users, Heart, CheckCircle, ArrowRight } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { auth, db } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function NewLandingPage() {
  const navigate = useNavigate();
  const [betaEmail, setBetaEmail] = useState('');
  const [betaSubmitted, setBetaSubmitted] = useState(false);
  const [betaError, setBetaError] = useState('');

  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBetaSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBetaError('');

    try {
      const { supabase } = await import('../../../lib/supabase');

      const { error } = await supabase
        .from('beta_signups')
        .insert([{ email: betaEmail, source: 'website' }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setBetaError('This email is already registered for beta access!');
        } else {
          throw error;
        }
      } else {
        setBetaSubmitted(true);
        setBetaEmail('');
      }
    } catch (err: any) {
      console.error('Beta signup error:', err);
      setBetaError('Failed to submit. Please try again.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await auth.signInWithPassword(email, password);
      if (error) {
        setError(error.message);
      } else {
        navigate('/app');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: designTokens.typography.fontFamily,
    }}>
      {/* Navigation */}
      <nav style={{
        borderBottom: '1px solid #e5e7eb',
        padding: '20px 0',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: designTokens.colors.primary.blue,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Music size={24} color="#ffffff" />
          </div>
          <span style={{
            fontSize: '24px',
            fontWeight: '700',
            color: designTokens.colors.neutral.charcoal,
          }}>
            CoreTet
          </span>
        </div>

        <button
          onClick={() => setShowLogin(!showLogin)}
          style={{
            padding: '10px 20px',
            backgroundColor: 'transparent',
            border: `1px solid ${designTokens.colors.borders.default}`,
            borderRadius: '8px',
            color: designTokens.colors.neutral.charcoal,
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          {showLogin ? 'Close' : 'Sign In'}
        </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        width: '100%',
        backgroundColor: '#ffffff',
        padding: '80px 40px',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
        <div style={{
          display: 'inline-block',
          padding: '6px 16px',
          backgroundColor: '#ebf8ff',
          border: `1px solid ${designTokens.colors.primary.blue}`,
          borderRadius: '20px',
          marginBottom: '24px',
        }}>
          <span style={{
            color: designTokens.colors.primary.blue,
            fontSize: '13px',
            fontWeight: '600',
          }}>
            🚀 Now in Private Beta
          </span>
        </div>

        <h1 style={{
          fontSize: '56px',
          fontWeight: '700',
          color: designTokens.colors.neutral.charcoal,
          margin: '0 0 24px 0',
          lineHeight: '1.1',
        }}>
          Music collaboration
          <br />
          <span style={{ color: designTokens.colors.primary.blue }}>made simple</span>
        </h1>

        <p style={{
          fontSize: '20px',
          color: designTokens.colors.neutral.darkGray,
          margin: '0 auto 40px',
          maxWidth: '600px',
          lineHeight: '1.6',
        }}>
          Upload tracks, leave timestamped feedback, and organize your music—all in one private space for your band.
        </p>

        {/* Beta Signup Form */}
        {!betaSubmitted ? (
          <form onSubmit={handleBetaSignup} style={{
            display: 'flex',
            gap: '12px',
            maxWidth: '500px',
            margin: '0 auto',
            justifyContent: 'center',
          }}>
            <input
              type="email"
              value={betaEmail}
              onChange={(e) => setBetaEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{
                flex: 1,
                padding: '14px 20px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: designTokens.typography.fontFamily,
              }}
            />
            <button
              type="submit"
              style={{
                padding: '14px 32px',
                backgroundColor: designTokens.colors.primary.blue,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Join Beta
            </button>
          </form>
        ) : (
          <div style={{
            padding: '16px 24px',
            backgroundColor: '#e6f7e6',
            border: '1px solid #90ee90',
            borderRadius: '8px',
            color: '#008000',
            maxWidth: '500px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <CheckCircle size={20} />
            <span>Thanks! We'll be in touch soon.</span>
          </div>
        )}

        {betaError && (
          <div style={{
            marginTop: '12px',
            color: '#dc2626',
            fontSize: '14px',
          }}>
            {betaError}
          </div>
        )}

        <p style={{
          fontSize: '14px',
          color: designTokens.colors.text.muted,
          marginTop: '16px',
        }}>
          Available on iOS • Web app coming soon
        </p>
        </div>
      </section>

      {/* Login Modal */}
      {showLogin && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}
        onClick={() => setShowLogin(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '400px',
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: designTokens.colors.neutral.charcoal,
              margin: '0 0 24px 0',
            }}>
              Sign in to CoreTet
            </h2>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: designTokens.colors.neutral.charcoal,
                  marginBottom: '6px',
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: designTokens.typography.fontFamily,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: designTokens.colors.neutral.charcoal,
                  marginBottom: '6px',
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: designTokens.typography.fontFamily,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {error && (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  color: '#dc2626',
                  fontSize: '14px',
                  marginBottom: '16px',
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: designTokens.colors.primary.blue,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Screenshot Preview Section */}
      <section style={{
        width: '100%',
        backgroundColor: '#f9fafb',
        padding: '80px 40px',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          {/* TODO: Add your app screenshots here */}
          <div style={{
            padding: '80px 40px',
            backgroundColor: '#e5e7eb',
            borderRadius: '12px',
            color: designTokens.colors.text.muted,
          }}>
            <p style={{ margin: 0, fontSize: '16px' }}>
              📱 App Screenshots
              <br />
              <span style={{ fontSize: '14px' }}>
                Use Screely.com or Mockuphone.com to create beautiful device mockups
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        width: '100%',
        backgroundColor: '#ffffff',
        padding: '80px 40px',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
        <h2 style={{
          fontSize: '40px',
          fontWeight: '700',
          color: designTokens.colors.neutral.charcoal,
          margin: '0 0 16px 0',
          textAlign: 'center',
        }}>
          Everything your band needs
        </h2>
        <p style={{
          fontSize: '18px',
          color: designTokens.colors.neutral.darkGray,
          margin: '0 auto 60px',
          textAlign: 'center',
          maxWidth: '600px',
        }}>
          Built for musicians who need a private, focused space to collaborate
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
        }}>
          {/* Feature 1 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#ebf8ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <MessageSquare size={28} color={designTokens.colors.primary.blue} />
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: designTokens.colors.neutral.charcoal,
              margin: '0 0 12px 0',
            }}>
              Timestamped Feedback
            </h3>
            <p style={{
              fontSize: '16px',
              color: designTokens.colors.neutral.darkGray,
              lineHeight: '1.6',
              margin: 0,
            }}>
              Leave comments at exact moments in tracks. Click any comment to jump right to that timestamp.
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#ebf8ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Music size={28} color={designTokens.colors.primary.blue} />
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: designTokens.colors.neutral.charcoal,
              margin: '0 0 12px 0',
            }}>
              Organized Set Lists
            </h3>
            <p style={{
              fontSize: '16px',
              color: designTokens.colors.neutral.darkGray,
              lineHeight: '1.6',
              margin: 0,
            }}>
              Create playlists for gigs, rehearsals, or recording sessions. Share them with your band in one tap.
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#ebf8ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Lock size={28} color={designTokens.colors.primary.blue} />
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: designTokens.colors.neutral.charcoal,
              margin: '0 0 12px 0',
            }}>
              Invite-Only & Private
            </h3>
            <p style={{
              fontSize: '16px',
              color: designTokens.colors.neutral.darkGray,
              lineHeight: '1.6',
              margin: 0,
            }}>
              Your tracks are never public. Only invited band members can access your music.
            </p>
          </div>

          {/* Feature 4 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#ebf8ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Heart size={28} color={designTokens.colors.primary.blue} />
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: designTokens.colors.neutral.charcoal,
              margin: '0 0 12px 0',
            }}>
              Like & Love Tracks
            </h3>
            <p style={{
              fontSize: '16px',
              color: designTokens.colors.neutral.darkGray,
              lineHeight: '1.6',
              margin: 0,
            }}>
              Quick ratings to show what's working. See what the band loves at a glance.
            </p>
          </div>

          {/* Feature 5 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#ebf8ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Upload size={28} color={designTokens.colors.primary.blue} />
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: designTokens.colors.neutral.charcoal,
              margin: '0 0 12px 0',
            }}>
              Easy Uploads
            </h3>
            <p style={{
              fontSize: '16px',
              color: designTokens.colors.neutral.darkGray,
              lineHeight: '1.6',
              margin: 0,
            }}>
              Drag and drop tracks from your phone or computer. Web interface for batch uploads coming soon.
            </p>
          </div>

          {/* Feature 6 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#ebf8ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Users size={28} color={designTokens.colors.primary.blue} />
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: designTokens.colors.neutral.charcoal,
              margin: '0 0 12px 0',
            }}>
              Collaborative Tagging
            </h3>
            <p style={{
              fontSize: '16px',
              color: designTokens.colors.neutral.darkGray,
              lineHeight: '1.6',
              margin: 0,
            }}>
              Tag tracks with keywords. Everyone in the band can add tags and search by them.
            </p>
          </div>
        </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section style={{
        width: '100%',
        backgroundColor: '#f9fafb',
        padding: '80px 40px',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <h2 style={{
            fontSize: '40px',
            fontWeight: '700',
            color: designTokens.colors.neutral.charcoal,
            margin: '0 0 60px 0',
            textAlign: 'center',
          }}>
            Perfect for
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            <div style={{
              padding: '32px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: designTokens.colors.neutral.charcoal,
                margin: '0 0 12px 0',
              }}>
                🎸 Bands
              </h3>
              <p style={{
                fontSize: '16px',
                color: designTokens.colors.neutral.darkGray,
                lineHeight: '1.6',
                margin: 0,
              }}>
                Share demos, rehearsal recordings, and arrange set lists for upcoming gigs.
              </p>
            </div>

            <div style={{
              padding: '32px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: designTokens.colors.neutral.charcoal,
                margin: '0 0 12px 0',
              }}>
                🎹 Producers
              </h3>
              <p style={{
                fontSize: '16px',
                color: designTokens.colors.neutral.darkGray,
                lineHeight: '1.6',
                margin: 0,
              }}>
                Get timestamped feedback from clients and collaborators on works in progress.
              </p>
            </div>

            <div style={{
              padding: '32px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: designTokens.colors.neutral.charcoal,
                margin: '0 0 12px 0',
              }}>
                🎼 Ensembles
              </h3>
              <p style={{
                fontSize: '16px',
                color: designTokens.colors.neutral.darkGray,
                lineHeight: '1.6',
                margin: 0,
              }}>
                Organize practice tracks, share parts, and coordinate rehearsals in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        width: '100%',
        backgroundColor: '#ffffff',
        padding: '80px 40px',
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
        <h2 style={{
          fontSize: '40px',
          fontWeight: '700',
          color: designTokens.colors.neutral.charcoal,
          margin: '0 0 24px 0',
        }}>
          Ready to collaborate?
        </h2>
        <p style={{
          fontSize: '18px',
          color: designTokens.colors.neutral.darkGray,
          margin: '0 0 32px 0',
        }}>
          Join our beta and start sharing music with your band today.
        </p>

        {!betaSubmitted && (
          <form onSubmit={handleBetaSignup} style={{
            display: 'flex',
            gap: '12px',
            maxWidth: '500px',
            margin: '0 auto',
          }}>
            <input
              type="email"
              value={betaEmail}
              onChange={(e) => setBetaEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{
                flex: 1,
                padding: '14px 20px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: designTokens.typography.fontFamily,
              }}
            />
            <button
              type="submit"
              style={{
                padding: '14px 32px',
                backgroundColor: designTokens.colors.primary.blue,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Get Started
              <ArrowRight size={18} />
            </button>
          </form>
        )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        width: '100%',
        borderTop: '1px solid #e5e7eb',
        padding: '40px',
        textAlign: 'center',
        backgroundColor: '#f9fafb',
      }}>
        <p style={{
          fontSize: '14px',
          color: designTokens.colors.text.muted,
          margin: 0,
        }}>
          © 2025 CoreTet. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
