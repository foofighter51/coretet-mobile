import React, { useState } from 'react';
import { MessageSquare, Lock, Upload, Users, Heart, CheckCircle, ArrowRight, Music, Layers } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { auth } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';

// Dark theme colors from darkTheme.ts
const colors = {
  bg: '#1a2332',
  card: '#222d3a',
  cardBorder: '#2a3545',
  gold: '#e9a63c',
  goldHover: '#d9962c',
  textPrimary: '#ffffff',
  textSecondary: '#d0d4d8',
  textMuted: '#8a95a0',
  textDim: '#6b7585',
  inputBg: '#2a3545',
  inputBorder: '#3a4555',
  error: '#fc8181',
  errorBg: '#5f1a1a',
  errorBorder: '#ef4444',
  success: '#68d391',
  successBg: '#1a4d3a',
  successBorder: '#10b981',
};

export function NewLandingPage() {
  const navigate = useNavigate();
  const [betaEmail, setBetaEmail] = useState('');
  const [betaSubmitted, setBetaSubmitted] = useState(false);
  const [betaError, setBetaError] = useState('');

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
        if (error.code === '23505') {
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

  const featureIconStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: colors.card,
    border: `1px solid ${colors.cardBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.bg,
      fontFamily: designTokens.typography.fontFamily,
      color: colors.textPrimary,
    }}>
      {/* Hero Section with Login */}
      <section style={{
        width: '100%',
        padding: '60px 24px 40px',
      }}>
        <div style={{
          maxWidth: '420px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          {/* Logo */}
          <img
            src="/logo.png"
            alt="CoreTet"
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 20px',
              display: 'block',
            }}
          />

          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: colors.textPrimary,
            margin: '0 0 8px 0',
            lineHeight: '1.1',
          }}>
            CoreTet
          </h1>

          <p style={{
            fontSize: '16px',
            color: colors.textSecondary,
            margin: '0 0 32px 0',
            lineHeight: '1.5',
          }}>
            Music collaboration for your band
          </p>

          {/* Login Form - directly on page */}
          <div style={{
            backgroundColor: colors.card,
            borderRadius: '12px',
            border: `1px solid ${colors.cardBorder}`,
            padding: '24px',
            textAlign: 'left',
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: colors.textPrimary,
              margin: '0 0 20px 0',
              textAlign: 'center',
            }}>
              Sign In
            </h2>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: colors.textSecondary,
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
                    padding: '12px 14px',
                    backgroundColor: colors.inputBg,
                    border: `1px solid ${colors.inputBorder}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: designTokens.typography.fontFamily,
                    boxSizing: 'border-box',
                    color: colors.textPrimary,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: colors.textSecondary,
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
                    padding: '12px 14px',
                    backgroundColor: colors.inputBg,
                    border: `1px solid ${colors.inputBorder}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: designTokens.typography.fontFamily,
                    boxSizing: 'border-box',
                    color: colors.textPrimary,
                    outline: 'none',
                  }}
                />
              </div>

              {error && (
                <div style={{
                  padding: '10px 12px',
                  backgroundColor: colors.errorBg,
                  border: `1px solid ${colors.errorBorder}`,
                  borderRadius: '8px',
                  color: colors.error,
                  fontSize: '13px',
                  marginBottom: '14px',
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: colors.gold,
                  color: colors.bg,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  fontFamily: designTokens.typography.fontFamily,
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '24px 0',
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: colors.cardBorder }} />
            <span style={{ fontSize: '13px', color: colors.textDim }}>or join the beta</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: colors.cardBorder }} />
          </div>

          {/* Beta Signup */}
          {!betaSubmitted ? (
            <form onSubmit={handleBetaSignup} style={{
              display: 'flex',
              gap: '10px',
            }}>
              <input
                type="email"
                value={betaEmail}
                onChange={(e) => setBetaEmail(e.target.value)}
                placeholder="Enter your email"
                required
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  backgroundColor: colors.inputBg,
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: designTokens.typography.fontFamily,
                  color: colors.textPrimary,
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '12px 20px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${colors.gold}`,
                  borderRadius: '8px',
                  color: colors.gold,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: designTokens.typography.fontFamily,
                }}
              >
                Join Beta
              </button>
            </form>
          ) : (
            <div style={{
              padding: '12px 16px',
              backgroundColor: colors.successBg,
              border: `1px solid ${colors.successBorder}`,
              borderRadius: '8px',
              color: colors.success,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
            }}>
              <CheckCircle size={18} />
              <span>Thanks! We'll be in touch soon.</span>
            </div>
          )}

          {betaError && (
            <div style={{
              marginTop: '10px',
              color: colors.error,
              fontSize: '13px',
            }}>
              {betaError}
            </div>
          )}

          <p style={{
            fontSize: '13px',
            color: colors.textDim,
            marginTop: '16px',
          }}>
            Available on iOS &bull; Web app coming soon
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        width: '100%',
        padding: '40px 24px 60px',
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: colors.textPrimary,
            margin: '0 0 8px 0',
            textAlign: 'center',
          }}>
            Everything your band needs
          </h2>
          <p style={{
            fontSize: '15px',
            color: colors.textMuted,
            margin: '0 auto 40px',
            textAlign: 'center',
            maxWidth: '500px',
          }}>
            A private, focused space to collaborate on music
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
          }}>
            {/* Feature 1: Timestamped Feedback */}
            <div style={{
              textAlign: 'center',
              padding: '24px 20px',
              backgroundColor: colors.card,
              borderRadius: '12px',
              border: `1px solid ${colors.cardBorder}`,
            }}>
              <div style={featureIconStyle}>
                <MessageSquare size={22} color={colors.gold} />
              </div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: colors.textPrimary,
                margin: '0 0 8px 0',
              }}>
                Timestamped Feedback
              </h3>
              <p style={{
                fontSize: '14px',
                color: colors.textMuted,
                lineHeight: '1.5',
                margin: 0,
              }}>
                Leave comments at exact moments in tracks. Click any comment to jump to that timestamp.
              </p>
            </div>

            {/* Feature 2: Works & Versions */}
            <div style={{
              textAlign: 'center',
              padding: '24px 20px',
              backgroundColor: colors.card,
              borderRadius: '12px',
              border: `1px solid ${colors.cardBorder}`,
            }}>
              <div style={featureIconStyle}>
                <Layers size={22} color={colors.gold} />
              </div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: colors.textPrimary,
                margin: '0 0 8px 0',
              }}>
                Works & Versions
              </h3>
              <p style={{
                fontSize: '14px',
                color: colors.textMuted,
                lineHeight: '1.5',
                margin: 0,
              }}>
                Organize songs as Works with multiple versions. Track how your music evolves from demo to final mix.
              </p>
            </div>

            {/* Feature 3: Private & Secure */}
            <div style={{
              textAlign: 'center',
              padding: '24px 20px',
              backgroundColor: colors.card,
              borderRadius: '12px',
              border: `1px solid ${colors.cardBorder}`,
            }}>
              <div style={featureIconStyle}>
                <Lock size={22} color={colors.gold} />
              </div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: colors.textPrimary,
                margin: '0 0 8px 0',
              }}>
                Invite-Only & Private
              </h3>
              <p style={{
                fontSize: '14px',
                color: colors.textMuted,
                lineHeight: '1.5',
                margin: 0,
              }}>
                Your tracks are never public. Only invited band members can access your music.
              </p>
            </div>

            {/* Feature 4: Like & Love */}
            <div style={{
              textAlign: 'center',
              padding: '24px 20px',
              backgroundColor: colors.card,
              borderRadius: '12px',
              border: `1px solid ${colors.cardBorder}`,
            }}>
              <div style={featureIconStyle}>
                <Heart size={22} color={colors.gold} />
              </div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: colors.textPrimary,
                margin: '0 0 8px 0',
              }}>
                Like & Love Tracks
              </h3>
              <p style={{
                fontSize: '14px',
                color: colors.textMuted,
                lineHeight: '1.5',
                margin: 0,
              }}>
                Quick ratings to show what's working. See what the band loves at a glance.
              </p>
            </div>

            {/* Feature 5: Easy Uploads */}
            <div style={{
              textAlign: 'center',
              padding: '24px 20px',
              backgroundColor: colors.card,
              borderRadius: '12px',
              border: `1px solid ${colors.cardBorder}`,
            }}>
              <div style={featureIconStyle}>
                <Upload size={22} color={colors.gold} />
              </div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: colors.textPrimary,
                margin: '0 0 8px 0',
              }}>
                Easy Uploads
              </h3>
              <p style={{
                fontSize: '14px',
                color: colors.textMuted,
                lineHeight: '1.5',
                margin: 0,
              }}>
                Upload tracks from your phone or computer. Drag and drop for batch uploads on desktop.
              </p>
            </div>

            {/* Feature 6: Collaborative Tagging */}
            <div style={{
              textAlign: 'center',
              padding: '24px 20px',
              backgroundColor: colors.card,
              borderRadius: '12px',
              border: `1px solid ${colors.cardBorder}`,
            }}>
              <div style={featureIconStyle}>
                <Users size={22} color={colors.gold} />
              </div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: colors.textPrimary,
                margin: '0 0 8px 0',
              }}>
                Collaborative Tagging
              </h3>
              <p style={{
                fontSize: '14px',
                color: colors.textMuted,
                lineHeight: '1.5',
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
        padding: '40px 24px 60px',
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: colors.textPrimary,
            margin: '0 0 32px 0',
            textAlign: 'center',
          }}>
            Perfect for
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
          }}>
            <div style={{
              padding: '24px',
              backgroundColor: colors.card,
              borderRadius: '12px',
              border: `1px solid ${colors.cardBorder}`,
            }}>
              <h3 style={{
                fontSize: '17px',
                fontWeight: '600',
                color: colors.textPrimary,
                margin: '0 0 8px 0',
              }}>
                Bands
              </h3>
              <p style={{
                fontSize: '14px',
                color: colors.textMuted,
                lineHeight: '1.5',
                margin: 0,
              }}>
                Share demos, rehearsal recordings, and arrange set lists for upcoming gigs.
              </p>
            </div>

            <div style={{
              padding: '24px',
              backgroundColor: colors.card,
              borderRadius: '12px',
              border: `1px solid ${colors.cardBorder}`,
            }}>
              <h3 style={{
                fontSize: '17px',
                fontWeight: '600',
                color: colors.textPrimary,
                margin: '0 0 8px 0',
              }}>
                Producers
              </h3>
              <p style={{
                fontSize: '14px',
                color: colors.textMuted,
                lineHeight: '1.5',
                margin: 0,
              }}>
                Get timestamped feedback from clients and collaborators on works in progress.
              </p>
            </div>

            <div style={{
              padding: '24px',
              backgroundColor: colors.card,
              borderRadius: '12px',
              border: `1px solid ${colors.cardBorder}`,
            }}>
              <h3 style={{
                fontSize: '17px',
                fontWeight: '600',
                color: colors.textPrimary,
                margin: '0 0 8px 0',
              }}>
                Ensembles
              </h3>
              <p style={{
                fontSize: '14px',
                color: colors.textMuted,
                lineHeight: '1.5',
                margin: 0,
              }}>
                Organize practice tracks, share parts, and coordinate rehearsals in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        width: '100%',
        borderTop: `1px solid ${colors.cardBorder}`,
        padding: '32px 24px',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '13px',
          color: colors.textDim,
          margin: 0,
        }}>
          &copy; 2026 CoreTet. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
