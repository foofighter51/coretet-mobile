import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, ThumbsUp, Plus, Bug, Lightbulb, HelpCircle, MessageCircle, Image as ImageIcon, X } from 'lucide-react';
import { designTokens } from '../../design/designTokens';
import { db, auth, storage } from '../../../lib/supabase';

export function FeedbackBoard() {
  const navigate = useNavigate();
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Form state
  const [category, setCategory] = useState<'bug' | 'feature' | 'question' | 'other'>('feature');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFeedback();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { user } = await auth.getCurrentUser();
    setCurrentUserId(user?.id || null);
  };

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const { data, error } = await db.feedback.getAll();
      if (error) {
        console.error('Failed to load feedback:', error);
      } else {
        // Add vote counts to each feedback item
        const feedbackWithCounts = await Promise.all(
          (data || []).map(async (item) => {
            const { count } = await db.feedbackVotes.getVoteCount(item.id);
            const hasVoted = currentUserId
              ? (await db.feedbackVotes.hasVoted(item.id, currentUserId)).hasVoted
              : false;
            return { ...item, voteCount: count, hasVoted };
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!currentUserId || !title.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      let imageUrl: string | undefined;

      // Upload image if selected
      if (selectedImage) {
        const timestamp = Date.now();
        const fileName = `feedback/${currentUserId}/${timestamp}_${selectedImage.name}`;

        const { data: uploadData, error: uploadError } = await storage.uploadAudio(selectedImage, fileName);

        if (uploadError) {
          console.error('Failed to upload image:', uploadError);
        } else if (uploadData) {
          const { data: urlData } = await storage.getPublicUrl('audio-files', fileName);
          imageUrl = urlData?.publicUrl;
        }
      }

      await db.feedback.create({
        user_id: currentUserId,
        category,
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('feature');
      setSelectedImage(null);
      setImagePreview(null);
      setShowCreateForm(false);

      // Reload feedback
      await loadFeedback();
    } catch (error) {
      console.error('Error creating feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (feedbackId: string, hasVoted: boolean) => {
    if (!currentUserId) return;

    try {
      if (hasVoted) {
        await db.feedbackVotes.unvote(feedbackId, currentUserId);
      } else {
        await db.feedbackVotes.vote(feedbackId, currentUserId);
      }

      // Reload to update vote counts
      await loadFeedback();
    } catch (error) {
      console.error('Error toggling vote:', error);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'bug': return <Bug size={16} />;
      case 'feature': return <Lightbulb size={16} />;
      case 'question': return <HelpCircle size={16} />;
      default: return <MessageCircle size={16} />;
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

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      open: '#6b7280',
      under_review: '#f59e0b',
      in_progress: '#3b82f6',
      completed: '#10b981',
      wont_fix: '#ef4444',
    };

    const labels: Record<string, string> = {
      open: 'Open',
      under_review: 'Under Review',
      in_progress: 'In Progress',
      completed: 'Completed',
      wont_fix: "Won't Fix",
    };

    return (
      <span style={{
        padding: '2px 8px',
        backgroundColor: colors[status] || '#6b7280',
        color: '#ffffff',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600',
        textTransform: 'uppercase',
      }}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{
        fontFamily: designTokens.typography.fontFamily,
        width: '100%',
        maxWidth: '425px',
        height: '100vh',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p>Loading feedback...</p>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: designTokens.typography.fontFamily,
      width: '100%',
      maxWidth: '425px',
      height: '100vh',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: '#f7fafc',
    }}>
      {/* Header */}
      <div style={{
        flexShrink: 0,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        paddingLeft: designTokens.spacing.md,
        paddingRight: designTokens.spacing.md,
        paddingBottom: designTokens.spacing.md,
        paddingTop: 'max(env(safe-area-inset-top), 12px)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px',
              backgroundColor: 'transparent',
              color: designTokens.colors.primary.blue,
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: designTokens.colors.primary.blue,
              color: '#ffffff',
              border: 'none',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            New Feedback
          </button>
        </div>

        <h1 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: designTokens.colors.neutral.charcoal,
          marginTop: '12px',
          marginBottom: '4px',
        }}>
          Community Feedback
        </h1>
        <p style={{
          fontSize: '14px',
          color: designTokens.colors.neutral.darkGray,
        }}>
          Share bugs, request features, and help improve the app
        </p>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: designTokens.spacing.md,
      }}>
        {/* Create Form */}
        {showCreateForm && (
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: designTokens.spacing.md,
            marginBottom: '16px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
              Create Feedback
            </h3>

            {/* Category Selection */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                Category
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(['bug', 'feature', 'question', 'other'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: category === cat ? getCategoryColor(cat) : '#ffffff',
                      color: category === cat ? '#ffffff' : '#4a5568',
                      border: `1px solid ${category === cat ? getCategoryColor(cat) : '#e2e8f0'}`,
                      borderRadius: '16px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {getCategoryIcon(cat)}
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary..."
                maxLength={100}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Screenshot Upload */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                Screenshot (optional)
              </label>

              {imagePreview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={imagePreview}
                    alt="Screenshot preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                  <button
                    onClick={handleRemoveImage}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    backgroundColor: '#f7fafc',
                    border: '1px dashed #cbd5e0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#4a5568',
                  }}
                >
                  <ImageIcon size={18} />
                  Add Screenshot
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCreateForm(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#e2e8f0',
                  color: '#4a5568',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !title.trim() || !description.trim()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: (submitting || !title.trim() || !description.trim())
                    ? '#cbd5e0'
                    : designTokens.colors.primary.blue,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: (submitting || !title.trim() || !description.trim()) ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        )}

        {/* Feedback List */}
        {feedbackList.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: designTokens.colors.neutral.darkGray,
          }}>
            <MessageSquare size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p>No feedback yet</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {feedbackList.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  {/* Vote Button */}
                  <button
                    onClick={() => handleVote(item.id, item.hasVoted)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '8px',
                      backgroundColor: item.hasVoted ? '#ebf8ff' : '#f7fafc',
                      border: `1px solid ${item.hasVoted ? designTokens.colors.primary.blue : '#e2e8f0'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      minWidth: '50px',
                    }}
                  >
                    <ThumbsUp
                      size={16}
                      fill={item.hasVoted ? designTokens.colors.primary.blue : 'none'}
                      color={item.hasVoted ? designTokens.colors.primary.blue : '#6b7280'}
                    />
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: item.hasVoted ? designTokens.colors.primary.blue : '#6b7280',
                      marginTop: '4px',
                    }}>
                      {item.voteCount}
                    </span>
                  </button>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        backgroundColor: getCategoryColor(item.category) + '20',
                        color: getCategoryColor(item.category),
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                      }}>
                        {getCategoryIcon(item.category)}
                        {item.category.toUpperCase()}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>

                    <h3 style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: designTokens.colors.neutral.charcoal,
                      marginBottom: '6px',
                    }}>
                      {item.title}
                    </h3>

                    <p style={{
                      fontSize: '14px',
                      color: designTokens.colors.neutral.darkGray,
                      lineHeight: '1.5',
                      marginBottom: '8px',
                    }}>
                      {item.description}
                    </p>

                    {/* Show screenshot if available */}
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt="Screenshot"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '300px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          marginBottom: '8px',
                          cursor: 'pointer',
                        }}
                        onClick={() => window.open(item.image_url, '_blank')}
                      />
                    )}

                    <div style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      display: 'flex',
                      gap: '12px',
                    }}>
                      <span>{item.profiles?.name || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
