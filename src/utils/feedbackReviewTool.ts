import { db } from '../../lib/supabase';

export interface FeedbackItem {
  id: string;
  user_id: string;
  category: 'bug' | 'feature' | 'question' | 'other';
  title: string;
  description: string;
  status: 'open' | 'under_review' | 'in_progress' | 'completed' | 'wont_fix';
  image_url?: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
  archived_at?: string;
  voteCount: number;
  commentCount: number;
  user: {
    name?: string;
  };
  comments: Array<{
    id: string;
    user_id: string;
    content: string;
    is_admin_response: boolean;
    created_at: string;
    user: {
      name?: string;
    };
  }>;
}

export interface FeedbackSummary {
  totalFeedback: number;
  byCategory: {
    bug: number;
    feature: number;
    question: number;
    other: number;
  };
  byStatus: {
    open: number;
    under_review: number;
    in_progress: number;
    completed: number;
    wont_fix: number;
  };
  archived: number;
  topVoted: FeedbackItem[];
  recentFeedback: FeedbackItem[];
  needsResponse: FeedbackItem[];
}

export async function getAllFeedbackForReview(includeArchived: boolean = false): Promise<FeedbackItem[]> {
  const { data: feedbackData, error } = await db.feedback.getAllIncludingArchived(includeArchived);

  if (error) {
    console.error('Error loading feedback:', error);
    throw error;
  }

  const enrichedFeedback = await Promise.all(
    (feedbackData || []).map(async (item) => {
      const { count } = await db.feedbackVotes.getVoteCount(item.id);
      const { data: comments } = await db.feedbackComments.getByFeedback(item.id);

      return {
        ...item,
        voteCount: count,
        commentCount: comments?.length || 0,
        user: {
          name: item.profiles?.name,
        },
        comments: (comments || []).map((comment) => ({
          id: comment.id,
          user_id: comment.user_id,
          content: comment.content,
          is_admin_response: comment.is_admin_response || false,
          created_at: comment.created_at,
          user: {
            name: comment.profiles?.name,
          },
        })),
      };
    })
  );

  return enrichedFeedback as FeedbackItem[];
}

export async function getFeedbackSummary(includeArchived: boolean = false): Promise<FeedbackSummary> {
  const allFeedback = await getAllFeedbackForReview(includeArchived);

  const summary: FeedbackSummary = {
    totalFeedback: allFeedback.length,
    byCategory: {
      bug: 0,
      feature: 0,
      question: 0,
      other: 0,
    },
    byStatus: {
      open: 0,
      under_review: 0,
      in_progress: 0,
      completed: 0,
      wont_fix: 0,
    },
    archived: 0,
    topVoted: [],
    recentFeedback: [],
    needsResponse: [],
  };

  allFeedback.forEach((item) => {
    summary.byCategory[item.category]++;
    summary.byStatus[item.status]++;
    if (item.archived) summary.archived++;
  });

  summary.topVoted = [...allFeedback]
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, 10);

  summary.recentFeedback = [...allFeedback]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  summary.needsResponse = allFeedback.filter(
    (item) =>
      !item.archived &&
      item.status !== 'completed' &&
      item.status !== 'wont_fix' &&
      !item.comments.some((c) => c.is_admin_response)
  );

  return summary;
}

export async function getFeedbackAsJSON(includeArchived: boolean = false): Promise<string> {
  const feedback = await getAllFeedbackForReview(includeArchived);
  return JSON.stringify(feedback, null, 2);
}

export async function getSummaryAsJSON(includeArchived: boolean = false): Promise<string> {
  const summary = await getFeedbackSummary(includeArchived);
  return JSON.stringify(summary, null, 2);
}

export async function getFeedbackByCategory(category: 'bug' | 'feature' | 'question' | 'other'): Promise<FeedbackItem[]> {
  const allFeedback = await getAllFeedbackForReview(false);
  return allFeedback.filter((item) => item.category === category);
}

export async function getOpenFeedback(): Promise<FeedbackItem[]> {
  const allFeedback = await getAllFeedbackForReview(false);
  return allFeedback.filter(
    (item) => !item.archived && (item.status === 'open' || item.status === 'under_review')
  );
}

export async function getFeedbackNeedingAttention(): Promise<FeedbackItem[]> {
  const allFeedback = await getAllFeedbackForReview(false);

  return allFeedback
    .filter(
      (item) =>
        !item.archived &&
        item.status !== 'completed' &&
        item.status !== 'wont_fix' &&
        !item.comments.some((c) => c.is_admin_response)
    )
    .sort((a, b) => b.voteCount - a.voteCount);
}

export const feedbackReviewTool = {
  getAllFeedback: getAllFeedbackForReview,
  getSummary: getFeedbackSummary,
  getFeedbackJSON: getFeedbackAsJSON,
  getSummaryJSON: getSummaryAsJSON,
  getByCategory: getFeedbackByCategory,
  getOpenFeedback,
  getNeedingAttention: getFeedbackNeedingAttention,
};

export default feedbackReviewTool;
