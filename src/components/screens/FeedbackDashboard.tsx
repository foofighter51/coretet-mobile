import React, { useState, useEffect } from 'react';
import { Bug, Lightbulb, HelpCircle, MessageCircle, ThumbsUp, Calendar, User, Send, Archive, ArchiveRestore, ChevronDown, ChevronUp } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { db, auth } from '../../../lib/supabase';

export function FeedbackDashboard() {
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'bug' | 'feature' | 'question' | 'other'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadFeedback();
    getCurrentUser();
  }, [showArchived]);

  const getCurrentUser = async () => {
    const { user } = await auth.getCurrentUser();
    setCurrentUserId(user?.id || null);
  };

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const { data, error } = await db.feedback.getAllIncludingArchived(showArchived);
      if (error) {
        console.error('Failed to load feedback:', error);
      } else {
        const feedbackWithCounts = await Promise.all(
          (data || []).map(async (item) => {
            const { count } = await db.feedbackVotes.getVoteCount(item.id);
            const { data: commentData } = await db.feedbackComments.getByFeedback(item.id);
            return { ...item, voteCount: count, commentCount: commentData?.length || 0 };
          })
        );
        setFeedbackList(feedbackWithCounts);
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (feedbackId: string) => {
    const { data } = await db.feedbackComments.getByFeedback(feedbackId);
    setComments(prev => ({ ...prev, [feedbackId]: data || [] }));
  };

  const toggleExpanded = (feedbackId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(feedbackId)) {
      newExpanded.delete(feedbackId);
    } else {
      newExpanded.add(feedbackId);
      if (!comments[feedbackId]) {
        loadComments(feedbackId);
      }
    }
    setExpandedItems(newExpanded);
  };

  const handleStatusUpdate = async (feedbackId: string, newStatus: string) => {
    try {
      await db.feedback.updateStatus(feedbackId, newStatus as any);
      await loadFeedback();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleArchiveToggle = async (feedbackId: string, isArchived: boolean) => {
    try {
      if (isArchived) {
        await db.feedback.unarchive(feedbackId);
      } else {
        await db.feedback.archive(feedbackId);
      }
      await loadFeedback();
    } catch (error) {
      console.error('Error toggling archive:', error);
    }
  };

  const handleSendResponse = async (feedbackId: string) => {
    if (!currentUserId || !responses[feedbackId]?.trim()) return;

    try {
      await db.feedbackComments.createAdminResponse(
        feedbackId,
        currentUserId,
        responses[feedbackId].trim()
      );

      setResponses(prev => ({ ...prev, [feedbackId]: '' }));
      await loadComments(feedbackId);
      await loadFeedback();
    } catch (error) {
      console.error('Error sending response:', error);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'bug': return <Bug size={18} />;
      case 'feature': return <Lightbulb size={18} />;
      case 'question': return <HelpCircle size={18} />;
      default: return <MessageCircle size={18} />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'bug': return '#ef4444';
      case 'feature': return '#3b82f6';
      case 'question': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#6b7280';
      case 'under_review': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'wont_fix': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const filteredFeedback = feedbackList.filter(item => {
    if (filter !== 'all' && item.category !== filter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: feedbackList.length,
    bugs: feedbackList.filter(f => f.category === 'bug').length,
    features: feedbackList.filter(f => f.category === 'feature').length,
    open: feedbackList.filter(f => f.status === 'open').length,
    completed: feedbackList.filter(f => f.status === 'completed').length,
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: designTokens.typography.fontFamily }}>
        Loading feedback...
      </div>
    );
  }

  return (
    <div data-admin-page="true" style={{
      fontFamily: designTokens.typography.fontFamily,
      width: '100%',
      maxWidth: '100%',
      margin: '0',
      padding: '32px 48px',
      backgroundColor: '#f7fafc',
      minHeight: '100vh',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
          Feedback Dashboard
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>
          Community feedback and feature requests
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '24px',
        marginBottom: '32px',
      }}>
        <StatCard label="Total Feedback" value={stats.total} color="#3b82f6" />
        <StatCard label="Bug Reports" value={stats.bugs} color="#ef4444" />
        <StatCard label="Feature Requests" value={stats.features} color="#8b5cf6" />
        <StatCard label="Open" value={stats.open} color="#f59e0b" />
        <StatCard label="Completed" value={stats.completed} color="#10b981" />
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '20px 24px',
        borderRadius: '8px',
        marginBottom: '24px',
        display: 'flex',
        gap: '24px',
        flexWrap: 'nowrap',
        alignItems: 'flex-end',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
            Category
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '14px',
            }}
          >
            <option value="all">All Categories</option>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="question">Question</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '14px',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="under_review">Under Review</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="wont_fix">Won't Fix</option>
          </select>
        </div>

        <button
          onClick={() => setShowArchived(!showArchived)}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: showArchived ? '2px solid #3b82f6' : '1px solid #e2e8f0',
            backgroundColor: showArchived ? '#ebf8ff' : '#ffffff',
            color: showArchived ? '#3b82f6' : '#4a5568',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Archive size={16} />
          {showArchived ? 'Hide Archived' : 'Show Archived'}
        </button>
      </div>

      {/* Feedback List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredFeedback.map((item) => {
          const isExpanded = expandedItems.has(item.id);
          const itemComments = comments[item.id] || [];

          return (
            <div
              key={item.id}
              style={{
                backgroundColor: '#ffffff',
                padding: '20px 24px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                opacity: item.archived ? 0.6 : 1,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
              }}
            >
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                {/* Vote Count */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '50px',
                  paddingTop: '4px',
                }}>
                  <ThumbsUp size={18} color="#6b7280" />
                  <span style={{ fontSize: '18px', fontWeight: '700', marginTop: '6px' }}>
                    {item.voteCount}
                  </span>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>votes</span>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      backgroundColor: getCategoryColor(item.category) + '20',
                      color: getCategoryColor(item.category),
                      borderRadius: '16px',
                      fontSize: '13px',
                      fontWeight: '600',
                    }}>
                      {getCategoryIcon(item.category)}
                      {item.category.toUpperCase()}
                    </span>

                    <select
                      value={item.status}
                      onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: getStatusColor(item.status),
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '16px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="open">Open</option>
                      <option value="under_review">Under Review</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="wont_fix">Won't Fix</option>
                    </select>

                    {item.archived && (
                      <span style={{
                        padding: '4px 12px',
                        backgroundColor: '#e2e8f0',
                        color: '#4a5568',
                        borderRadius: '16px',
                        fontSize: '13px',
                        fontWeight: '600',
                      }}>
                        ARCHIVED
                      </span>
                    )}

                    <button
                      onClick={() => handleArchiveToggle(item.id, item.archived)}
                      style={{
                        marginLeft: 'auto',
                        padding: '6px 12px',
                        backgroundColor: '#f7fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        color: '#4a5568',
                      }}
                    >
                      {item.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                      {item.archived ? 'Unarchive' : 'Archive'}
                    </button>
                  </div>

                  <h2
                    onClick={() => toggleExpanded(item.id)}
                    style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      color: designTokens.colors.neutral.charcoal,
                    }}
                  >
                    {item.title}
                  </h2>

                  <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#4a5568', marginBottom: '12px' }}>
                    {item.description}
                  </p>

                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt="Screenshot"
                      style={{
                        maxWidth: '600px',
                        maxHeight: '400px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        marginBottom: '16px',
                        cursor: 'pointer',
                      }}
                      onClick={() => window.open(item.image_url, '_blank')}
                    />
                  )}

                  <div style={{
                    display: 'flex',
                    gap: '24px',
                    fontSize: '14px',
                    color: '#9ca3af',
                    flexWrap: 'wrap',
                    marginBottom: '16px',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={14} />
                      {item.profiles?.name || 'Anonymous'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} />
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#3b82f6',
                        fontSize: '14px',
                        padding: 0,
                      }}
                    >
                      <MessageCircle size={14} />
                      {item.commentCount} comments
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  {/* Comments Section */}
                  {isExpanded && (
                    <div style={{
                      backgroundColor: '#f7fafc',
                      borderRadius: '6px',
                      padding: '16px',
                      marginTop: '12px',
                    }}>
                      {itemComments.length > 0 && (
                        <div style={{ marginBottom: '16px' }}>
                          {itemComments.map((comment: any) => (
                            <div
                              key={comment.id}
                              style={{
                                padding: '12px',
                                backgroundColor: comment.is_admin_response ? '#ebf8ff' : '#ffffff',
                                borderLeft: comment.is_admin_response ? '3px solid #3b82f6' : 'none',
                                borderRadius: '6px',
                                marginBottom: '8px',
                              }}
                            >
                              <div style={{
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'center',
                                marginBottom: '6px',
                              }}>
                                <span style={{
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  color: '#4a5568',
                                }}>
                                  {comment.profiles?.name || 'Anonymous'}
                                </span>
                                {comment.is_admin_response && (
                                  <span style={{
                                    fontSize: '11px',
                                    padding: '2px 6px',
                                    backgroundColor: '#3b82f6',
                                    color: '#ffffff',
                                    borderRadius: '4px',
                                    fontWeight: '600',
                                  }}>
                                    ADMIN
                                  </span>
                                )}
                                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                  {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p style={{
                                fontSize: '14px',
                                color: '#4a5568',
                                lineHeight: '1.5',
                                margin: 0,
                              }}>
                                {comment.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Admin Response Input */}
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                      }}>
                        <input
                          type="text"
                          placeholder="Write admin response..."
                          value={responses[item.id] || ''}
                          onChange={(e) => setResponses(prev => ({ ...prev, [item.id]: e.target.value }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSendResponse(item.id);
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: '10px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '14px',
                          }}
                        />
                        <button
                          onClick={() => handleSendResponse(item.id)}
                          disabled={!responses[item.id]?.trim()}
                          style={{
                            padding: '10px 16px',
                            backgroundColor: responses[item.id]?.trim() ? '#3b82f6' : '#e2e8f0',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: responses[item.id]?.trim() ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Send size={16} />
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFeedback.length === 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          padding: '60px',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#9ca3af',
        }}>
          No feedback matches the selected filters
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ fontSize: '32px', fontWeight: '700', color }}>
        {value}
      </div>
    </div>
  );
}
