import React, { useState, useEffect } from 'react';
import { Bug, Lightbulb, HelpCircle, MessageCircle, ThumbsUp, Calendar, User } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { db } from '../../../lib/supabase';

export function FeedbackDashboard() {
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'bug' | 'feature' | 'question' | 'other'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const { data, error } = await db.feedback.getAll();
      if (error) {
        console.error('Failed to load feedback:', error);
      } else {
        // Add vote counts
        const feedbackWithCounts = await Promise.all(
          (data || []).map(async (item) => {
            const { count } = await db.feedbackVotes.getVoteCount(item.id);
            const { data: comments } = await db.feedbackComments.getByFeedback(item.id);
            return { ...item, voteCount: count, commentCount: comments?.length || 0 };
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

  const handleStatusUpdate = async (feedbackId: string, newStatus: string) => {
    try {
      await db.feedback.updateStatus(feedbackId, newStatus as any);
      await loadFeedback();
    } catch (error) {
      console.error('Error updating status:', error);
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
    <div style={{
      fontFamily: designTokens.typography.fontFamily,
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '32px',
      backgroundColor: '#f7fafc',
      minHeight: '100vh',
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
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
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '24px',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
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
      </div>

      {/* Feedback List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredFeedback.map((item) => (
          <div
            key={item.id}
            style={{
              backgroundColor: '#ffffff',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', gap: '24px' }}>
              {/* Vote Count */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '60px',
              }}>
                <ThumbsUp size={20} color="#6b7280" />
                <span style={{ fontSize: '20px', fontWeight: '700', marginTop: '8px' }}>
                  {item.voteCount}
                </span>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>votes</span>
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
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
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
                  {item.title}
                </h2>

                <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#4a5568', marginBottom: '16px' }}>
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
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageCircle size={14} />
                    {item.commentCount} comments
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
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
