# Feedback Admin System - User Guide

## Overview

The CoreTet feedback system allows testers to submit bugs, feature requests, and questions directly from the mobile app. Admins can manage this feedback through a browser-based dashboard.

---

## 🎯 Quick Start

### For Admins (Browser)

1. **Access the Dashboard**
   ```
   https://your-app-url/admin/feedback
   ```

2. **What You Can Do**
   - View all feedback with filtering (category, status)
   - Update status (Open → Under Review → In Progress → Completed/Won't Fix)
   - Respond to feedback items
   - Archive/unarchive feedback
   - View vote counts and comments

### For Testers (Mobile App)

1. **Access Feedback Board**
   - Tap "Feedback" from the main menu
   - Or navigate to `/feedback` route

2. **Submit Feedback**
   - Choose category (Bug, Feature, Question, Other)
   - Add title and description
   - Optionally attach screenshot
   - Submit

---

## 🛠️ Admin Dashboard Features

### 1. Filtering & Organization

**Category Filters:**
- 🐛 Bug - Technical issues
- 💡 Feature - Feature requests
- ❓ Question - User questions
- 📝 Other - General feedback

**Status Filters:**
- Open - New, unreviewed items
- Under Review - Being evaluated
- In Progress - Actively being worked on
- Completed - Resolved/implemented
- Won't Fix - Declined requests

**Archive Toggle:**
- Click "Show Archived" to view archived items
- Click "Hide Archived" to hide them

### 2. Responding to Feedback

**To respond:**
1. Click the comment count to expand the feedback item
2. Type your response in the input field
3. Press Enter or click "Send"
4. Your response will be marked with an "ADMIN" badge

**Admin responses:**
- Automatically flagged as `is_admin_response: true`
- Displayed with blue background and border
- Visible to testers in the mobile app

### 3. Archiving Feedback

**When to archive:**
- Completed items that are no longer relevant
- Duplicate submissions
- Spam or invalid feedback

**How to archive:**
- Click "Archive" button on any feedback item
- Archived items appear faded with an "ARCHIVED" badge
- Can be unarchived anytime with "Unarchive" button

**Note:** Archived items are hidden by default but can be viewed with "Show Archived" toggle.

### 4. Status Management

Update status to reflect current state:
- **Open** → Initial state for new feedback
- **Under Review** → You're evaluating it
- **In Progress** → Actively working on it
- **Completed** → Fixed/implemented
- **Won't Fix** → Decided not to pursue

---

## 🤖 AI-Accessible Feedback Review

### Browser Console Access

The feedback system includes a CLI tool accessible from the browser console when the app is running.

**Available Commands:**

```javascript
// Show high-level summary
showFeedbackSummary()

// Show all feedback items
showAllFeedback()

// Show items needing admin response
showNeedsAttention()

// Show all bug reports
showBugs()

// Show all feature requests
showFeatureRequests()
```

**Direct API Access:**

```javascript
// Access the full feedback tool
window.feedbackTool

// Get all feedback (includes archived if true)
await window.feedbackTool.getAllFeedback(false)

// Get summary data
await window.feedbackTool.getSummary()

// Get feedback by category
await window.feedbackTool.getByCategory('bug')

// Get open feedback only
await window.feedbackTool.getOpenFeedback()

// Get feedback needing attention
await window.feedbackTool.getNeedingAttention()

// Export as JSON
await window.feedbackTool.getFeedbackJSON()
await window.feedbackTool.getSummaryJSON()
```

### For Claude (AI Assistant)

When you need to review tester feedback:

1. **Ask the user to run this in the browser console:**
   ```javascript
   await showFeedbackSummary()
   ```

2. **For detailed analysis, request:**
   ```javascript
   await window.feedbackTool.getSummaryJSON()
   ```
   Then copy/paste the output.

3. **For specific feedback items:**
   ```javascript
   await window.feedbackTool.getNeedingAttention()
   ```

This avoids copy/pasting large amounts of data manually.

---

## 📊 Database Schema

### Tables

**`feedback`**
- `id` - UUID primary key
- `user_id` - References profiles table
- `category` - bug | feature | question | other
- `title` - Brief summary (max 100 chars in UI)
- `description` - Detailed description
- `status` - open | under_review | in_progress | completed | wont_fix
- `image_url` - Optional screenshot URL
- `archived` - Boolean flag
- `archived_at` - Timestamp when archived
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**`feedback_votes`**
- `id` - UUID primary key
- `feedback_id` - References feedback table
- `user_id` - References profiles table
- Unique constraint on (feedback_id, user_id)

**`feedback_comments`**
- `id` - UUID primary key
- `feedback_id` - References feedback table
- `user_id` - References profiles table
- `content` - Comment text
- `is_admin_response` - Boolean flag
- `created_at` - Creation timestamp

### RLS Policies

- Anyone can view feedback, votes, and comments
- Users can create/update/delete their own feedback
- Users can vote/unvote on any feedback
- Users can comment on any feedback
- Authenticated users can update feedback status (admin feature)
- Users can archive/unarchive feedback (admin feature)

**Note:** Currently, any authenticated user can perform admin actions. You may want to add role-based access control later.

---

## 🚀 Implementation Details

### File Structure

```
src/
├── components/screens/
│   ├── FeedbackBoard.tsx         # Mobile tester interface
│   └── FeedbackDashboard.tsx     # Admin interface
├── utils/
│   ├── feedbackReviewTool.ts     # AI-accessible API
│   └── feedbackCLI.ts            # Browser console commands
lib/
└── supabase.ts                    # Database helpers
supabase/migrations/
├── 20251007_add_feedback_system.sql
├── 20251007_add_feedback_screenshots.sql
└── 20251008_add_feedback_archive.sql
```

### API Methods (lib/supabase.ts)

**Feedback Operations:**
```typescript
db.feedback.create(feedback)
db.feedback.getAll()
db.feedback.getAllIncludingArchived(includeArchived)
db.feedback.getById(feedbackId)
db.feedback.updateStatus(feedbackId, status)
db.feedback.archive(feedbackId)
db.feedback.unarchive(feedbackId)
db.feedback.delete(feedbackId)
```

**Vote Operations:**
```typescript
db.feedbackVotes.vote(feedbackId, userId)
db.feedbackVotes.unvote(feedbackId, userId)
db.feedbackVotes.hasVoted(feedbackId, userId)
db.feedbackVotes.getVoteCount(feedbackId)
```

**Comment Operations:**
```typescript
db.feedbackComments.create(comment)
db.feedbackComments.createAdminResponse(feedbackId, userId, content)
db.feedbackComments.getByFeedback(feedbackId)
db.feedbackComments.delete(commentId)
```

---

## 🔒 Security Considerations

### Current State
- Any authenticated user can access admin dashboard
- Any authenticated user can update status, archive, and respond

### Recommended Improvements
1. **Add admin role checking:**
   ```sql
   CREATE POLICY "Only admins can update feedback status"
   ON feedback FOR UPDATE
   USING (
     auth.uid() IS NOT NULL AND
     auth.jwt()->>'role' = 'admin'
   );
   ```

2. **Implement role-based UI:**
   - Check user role before showing admin dashboard
   - Hide admin features from non-admin users

3. **Add audit logging:**
   - Track who changed status
   - Log archive/unarchive actions
   - Record admin responses

---

## 📝 Workflow Examples

### Example 1: Responding to a Bug Report

1. User submits bug via mobile app
2. Admin sees it in dashboard (category: Bug, status: Open)
3. Admin changes status to "Under Review"
4. Admin expands comments and types response: "Thanks for reporting! Looking into this."
5. Admin investigates and starts fix
6. Admin updates status to "In Progress"
7. After fix is deployed, admin updates status to "Completed"
8. After some time, admin archives the completed bug

### Example 2: Managing Feature Requests

1. Multiple users submit similar feature requests
2. Admin reviews all feature requests: `showFeatureRequests()`
3. Admin consolidates by:
   - Responding to duplicates: "This is a duplicate of #123"
   - Archiving duplicates
   - Keeping the highest-voted one as "Under Review"
4. Admin prioritizes based on votes
5. When implemented, marks as "Completed"

### Example 3: AI Review Workflow

1. User asks Claude: "Can you review the tester feedback?"
2. Claude asks user to run: `showNeedsAttention()`
3. User copies output and shares with Claude
4. Claude analyzes trends and suggests priorities
5. User implements Claude's recommendations
6. User marks items with admin responses

---

## 🐛 Troubleshooting

### Dashboard not loading feedback
- Check browser console for errors
- Verify Supabase connection
- Run migration: `20251008_add_feedback_archive.sql`

### Can't send admin responses
- Ensure user is authenticated
- Check `currentUserId` is set
- Verify `is_admin_response` column exists in DB

### Archive toggle not working
- Run migration to add `archived` and `archived_at` columns
- Check RLS policies allow UPDATE on feedback table

### CLI commands not available
- Ensure app is running in browser
- Check console for "Feedback CLI Tools Loaded!" message
- Verify `feedbackCLI.ts` is imported in App.tsx

---

## 🎯 Next Steps / Future Enhancements

1. **Role-based access control** - Restrict admin features to admin users
2. **Email notifications** - Notify admins of new feedback
3. **Bulk actions** - Archive multiple items at once
4. **Feedback analytics** - Charts and trends over time
5. **Integration with issue tracker** - Sync with GitHub Issues or Jira
6. **Feedback templates** - Pre-fill common responses
7. **Search functionality** - Search across all feedback
8. **Export to CSV** - Download feedback reports

---

## 📞 Support

For questions or issues with the feedback system:
- Check this guide first
- Review code in `src/components/screens/FeedbackDashboard.tsx`
- Check database migrations in `supabase/migrations/`
- Ask Claude for help with specific implementations

---

**Last Updated:** 2025-10-08
**Version:** 1.0
