import React, { useState } from 'react';
import { Music } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { auth } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await auth.signUpWithPhone(phone);
      if (error) {
        setError(error.message);
      } else {
        setCodeSent(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await auth.verifyOtp(phone, code);
      if (error) {
        setError(error.message);
      } else {
        navigate('/admin/feedback');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#ffffff',
      fontFamily: designTokens.typography.fontFamily,
    }}>
      <div style={{
        maxWidth: '600px',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: designTokens.colors.primary.blue,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <Music size={40} color="#ffffff" />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          color: designTokens.colors.neutral.charcoal,
          margin: '0 0 16px 0',
        }}>
          CoreTet
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: '20px',
          color: designTokens.colors.neutral.darkGray,
          margin: '0 0 32px 0',
          lineHeight: '1.6',
        }}>
          Collaborate on music with your band
        </p>

        {/* Beta Badge */}
        <div style={{
          display: 'inline-block',
          padding: '8px 16px',
          backgroundColor: '#ebf8ff',
          border: `1px solid ${designTokens.colors.primary.blue}`,
          borderRadius: '20px',
          marginBottom: '32px',
        }}>
          <span style={{
            color: designTokens.colors.primary.blue,
            fontSize: '14px',
            fontWeight: '600',
          }}>
            🚀 Currently in Private Beta
          </span>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '16px',
          color: designTokens.colors.neutral.darkGray,
          margin: '0 0 40px 0',
          lineHeight: '1.8',
        }}>
          CoreTet is a collaborative music platform for bands and ensembles.
          Upload tracks, rate music together, and build shared playlists.
          Currently available for TestFlight beta testers.
        </p>

        {/* TestFlight Info */}
        <div style={{
          padding: '24px',
          backgroundColor: '#f7fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: designTokens.colors.neutral.charcoal,
            margin: '0 0 12px 0',
          }}>
            Beta Testing on iOS
          </h3>
          <p style={{
            fontSize: '14px',
            color: designTokens.colors.neutral.darkGray,
            margin: 0,
            lineHeight: '1.6',
          }}>
            CoreTet is currently available exclusively to invited TestFlight beta testers.
            All content is private and requires authentication to access.
          </p>
        </div>

        {/* Admin Login Toggle */}
        {!showAdminLogin && (
          <button
            onClick={() => setShowAdminLogin(true)}
            style={{
              marginTop: '32px',
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: `1px solid ${designTokens.colors.neutral.lightGray}`,
              borderRadius: '8px',
              color: designTokens.colors.neutral.darkGray,
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: designTokens.typography.fontFamily,
            }}
          >
            Admin Login
          </button>
        )}

        {/* Admin Login Form */}
        {showAdminLogin && (
          <div style={{
            marginTop: '32px',
            padding: '24px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            textAlign: 'left',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: designTokens.colors.neutral.charcoal,
              margin: '0 0 16px 0',
              textAlign: 'center',
            }}>
              Admin Access
            </h3>

            {!codeSent ? (
              <form onSubmit={handleSendCode}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: designTokens.colors.neutral.charcoal,
                    marginBottom: '6px',
                  }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
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
                  disabled={loading || !phone}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: loading || !phone ? '#e2e8f0' : designTokens.colors.primary.blue,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: loading || !phone ? 'not-allowed' : 'pointer',
                    fontFamily: designTokens.typography.fontFamily,
                  }}
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowAdminLogin(false)}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '12px',
                    backgroundColor: 'transparent',
                    color: designTokens.colors.neutral.darkGray,
                    border: 'none',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontFamily: designTokens.typography.fontFamily,
                  }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: designTokens.colors.neutral.charcoal,
                    marginBottom: '6px',
                  }}>
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: designTokens.typography.fontFamily,
                      boxSizing: 'border-box',
                    }}
                  />
                  <p style={{
                    fontSize: '12px',
                    color: designTokens.colors.neutral.darkGray,
                    margin: '6px 0 0 0',
                  }}>
                    Code sent to {phone}
                  </p>
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
                  disabled={loading || !code}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: loading || !code ? '#e2e8f0' : designTokens.colors.primary.blue,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: loading || !code ? 'not-allowed' : 'pointer',
                    fontFamily: designTokens.typography.fontFamily,
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCodeSent(false);
                    setCode('');
                    setError('');
                  }}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '12px',
                    backgroundColor: 'transparent',
                    color: designTokens.colors.neutral.darkGray,
                    border: 'none',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontFamily: designTokens.typography.fontFamily,
                  }}
                >
                  Back
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer */}
        <p style={{
          fontSize: '14px',
          color: designTokens.colors.neutral.gray,
          margin: '40px 0 0 0',
        }}>
          © 2025 CoreTet. All rights reserved.
        </p>
      </div>
    </div>
  );
}
