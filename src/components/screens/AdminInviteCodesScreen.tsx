import React, { useState, useEffect } from 'react';
import { useDesignTokens } from '../../design/useDesignTokens';
import { inviteCodeService } from '../../utils/inviteCodeService';
import { Copy, Check, X } from 'lucide-react';

interface InviteCode {
  id: string;
  code: string;
  created_by: string | null;
  max_uses: number;
  current_uses: number;
  expires_at: string;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export function AdminInviteCodesScreen() {
  const designTokens = useDesignTokens();
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Generation options
  const [maxUses, setMaxUses] = useState(1);
  const [expiresInDays, setExpiresInDays] = useState(90);
  const [batchSize, setBatchSize] = useState(1);

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await inviteCodeService.getAllCodes();

    if (fetchError) {
      setError(fetchError.message);
    } else if (data) {
      setCodes(data);
    }

    setLoading(false);
  };

  const handleGenerateCode = async () => {
    setGenerating(true);
    setError(null);

    try {
      const newCodes: InviteCode[] = [];

      // Generate multiple codes if batch size > 1
      for (let i = 0; i < batchSize; i++) {
        const { data, error: genError } = await inviteCodeService.generateCode({
          maxUses,
          expiresInDays,
        });

        if (genError) {
          setError(genError.message);
          break;
        } else if (data) {
          newCodes.push(data);
        }
      }

      if (newCodes.length > 0) {
        setCodes([...newCodes, ...codes]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate code');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeactivateCode = async (codeId: string) => {
    if (!confirm('Are you sure you want to deactivate this code?')) {
      return;
    }

    const { error: deactivateError } = await inviteCodeService.deactivateCode(codeId);

    if (deactivateError) {
      setError(deactivateError.message);
    } else {
      // Update local state
      setCodes(codes.map(code =>
        code.id === codeId ? { ...code, is_active: false } : code
      ));
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: designTokens.spacing.xl,
      fontFamily: designTokens.typography.fontFamily,
    }}>
      <h1 style={{
        fontSize: '32px',
        fontWeight: '600',
        color: designTokens.colors.text.primary,
        marginBottom: designTokens.spacing.lg,
      }}>
        Beta Invite Codes
      </h1>

      {/* Generation Controls */}
      <div style={{
        backgroundColor: designTokens.colors.surface.primary,
        borderRadius: designTokens.borderRadius.lg,
        padding: designTokens.spacing.lg,
        marginBottom: designTokens.spacing.xl,
        border: `1px solid ${designTokens.colors.borders.subtle}`,
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: designTokens.colors.text.primary,
          marginBottom: designTokens.spacing.md,
        }}>
          Generate New Codes
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: designTokens.spacing.md,
          marginBottom: designTokens.spacing.md,
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: designTokens.colors.text.secondary,
              marginBottom: '4px',
            }}>
              Max Uses Per Code
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={maxUses}
              onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: `1px solid ${designTokens.colors.borders.subtle}`,
                borderRadius: designTokens.borderRadius.md,
                backgroundColor: designTokens.colors.surface.secondary,
                color: designTokens.colors.text.primary,
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: designTokens.colors.text.secondary,
              marginBottom: '4px',
            }}>
              Expires In (Days)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 90)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: `1px solid ${designTokens.colors.borders.subtle}`,
                borderRadius: designTokens.borderRadius.md,
                backgroundColor: designTokens.colors.surface.secondary,
                color: designTokens.colors.text.primary,
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: designTokens.colors.text.secondary,
              marginBottom: '4px',
            }}>
              Batch Size
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value) || 1)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: `1px solid ${designTokens.colors.borders.subtle}`,
                borderRadius: designTokens.borderRadius.md,
                backgroundColor: designTokens.colors.surface.secondary,
                color: designTokens.colors.text.primary,
              }}
            />
          </div>
        </div>

        <button
          onClick={handleGenerateCode}
          disabled={generating}
          style={{
            padding: '12px 24px',
            backgroundColor: designTokens.colors.primary.blue,
            color: '#ffffff',
            border: 'none',
            borderRadius: designTokens.borderRadius.md,
            fontSize: '14px',
            fontWeight: '600',
            cursor: generating ? 'not-allowed' : 'pointer',
            opacity: generating ? 0.6 : 1,
          }}
        >
          {generating ? 'Generating...' : `Generate ${batchSize} Code${batchSize > 1 ? 's' : ''}`}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: designTokens.borderRadius.md,
          color: '#c00',
          fontSize: '14px',
          marginBottom: designTokens.spacing.lg,
        }}>
          {error}
        </div>
      )}

      {/* Codes Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: designTokens.colors.text.secondary }}>
          Loading codes...
        </div>
      ) : codes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: designTokens.colors.text.secondary }}>
          No invite codes yet. Generate your first code above.
        </div>
      ) : (
        <div style={{
          backgroundColor: designTokens.colors.surface.primary,
          borderRadius: designTokens.borderRadius.lg,
          border: `1px solid ${designTokens.colors.borders.subtle}`,
          overflow: 'hidden',
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}>
            <thead>
              <tr style={{
                backgroundColor: designTokens.colors.surface.secondary,
                borderBottom: `1px solid ${designTokens.colors.borders.subtle}`,
              }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: designTokens.colors.text.secondary }}>Code</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: designTokens.colors.text.secondary }}>Uses</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: designTokens.colors.text.secondary }}>Created</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: designTokens.colors.text.secondary }}>Expires</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: designTokens.colors.text.secondary }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: designTokens.colors.text.secondary }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.map(code => (
                <tr
                  key={code.id}
                  style={{
                    borderBottom: `1px solid ${designTokens.colors.borders.subtle}`,
                  }}
                >
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <code style={{
                        fontFamily: 'monospace',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: designTokens.colors.text.primary,
                        letterSpacing: '2px',
                      }}>
                        {code.code}
                      </code>
                      <button
                        onClick={() => handleCopyCode(code.code)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: copiedCode === code.code ? '#90ee90' : designTokens.colors.text.tertiary,
                        }}
                        title="Copy code"
                      >
                        {copiedCode === code.code ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', color: designTokens.colors.text.secondary }}>
                    <span style={{
                      fontWeight: '600',
                      color: code.current_uses >= code.max_uses ? '#ffa500' : designTokens.colors.text.primary
                    }}>
                      {code.current_uses}
                    </span>
                    {' / '}
                    {code.max_uses}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: designTokens.colors.text.secondary }}>
                    {formatDate(code.created_at)}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: isExpired(code.expires_at) ? '#c00' : designTokens.colors.text.secondary }}>
                    {formatDate(code.expires_at)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {!code.is_active ? (
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: '#fee',
                        color: '#c00',
                      }}>
                        Inactive
                      </span>
                    ) : isExpired(code.expires_at) ? (
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: '#fff3cd',
                        color: '#856404',
                      }}>
                        Expired
                      </span>
                    ) : code.current_uses >= code.max_uses ? (
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: '#fff3cd',
                        color: '#856404',
                      }}>
                        Full
                      </span>
                    ) : (
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: '#e6f7e6',
                        color: '#008000',
                      }}>
                        Active
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {code.is_active && (
                      <button
                        onClick={() => handleDeactivateCode(code.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: designTokens.colors.text.tertiary,
                        }}
                        title="Deactivate code"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Statistics */}
      <div style={{
        marginTop: designTokens.spacing.xl,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: designTokens.spacing.md,
      }}>
        <div style={{
          backgroundColor: designTokens.colors.surface.primary,
          borderRadius: designTokens.borderRadius.lg,
          padding: designTokens.spacing.md,
          border: `1px solid ${designTokens.colors.borders.subtle}`,
        }}>
          <div style={{ fontSize: '14px', color: designTokens.colors.text.secondary, marginBottom: '4px' }}>
            Total Codes
          </div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: designTokens.colors.text.primary }}>
            {codes.length}
          </div>
        </div>

        <div style={{
          backgroundColor: designTokens.colors.surface.primary,
          borderRadius: designTokens.borderRadius.lg,
          padding: designTokens.spacing.md,
          border: `1px solid ${designTokens.colors.borders.subtle}`,
        }}>
          <div style={{ fontSize: '14px', color: designTokens.colors.text.secondary, marginBottom: '4px' }}>
            Active Codes
          </div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#008000' }}>
            {codes.filter(c => c.is_active && !isExpired(c.expires_at) && c.current_uses < c.max_uses).length}
          </div>
        </div>

        <div style={{
          backgroundColor: designTokens.colors.surface.primary,
          borderRadius: designTokens.borderRadius.lg,
          padding: designTokens.spacing.md,
          border: `1px solid ${designTokens.colors.borders.subtle}`,
        }}>
          <div style={{ fontSize: '14px', color: designTokens.colors.text.secondary, marginBottom: '4px' }}>
            Total Uses
          </div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: designTokens.colors.text.primary }}>
            {codes.reduce((sum, c) => sum + c.current_uses, 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
