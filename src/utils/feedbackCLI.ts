import feedbackReviewTool from './feedbackReviewTool';

declare global {
  interface Window {
    feedbackTool: typeof feedbackReviewTool;
    showFeedbackSummary: () => Promise<void>;
    showAllFeedback: () => Promise<void>;
    showNeedsAttention: () => Promise<void>;
    showBugs: () => Promise<void>;
    showFeatureRequests: () => Promise<void>;
  }
}

if (typeof window !== 'undefined') {
  window.feedbackTool = feedbackReviewTool;

  window.showFeedbackSummary = async () => {
    const summary = await feedbackReviewTool.getSummary();
    console.log('=== FEEDBACK SUMMARY ===');
    console.log(`Total Feedback: ${summary.totalFeedback}`);
    console.log(`\nBy Category:`);
    console.log(`  🐛 Bugs: ${summary.byCategory.bug}`);
    console.log(`  💡 Features: ${summary.byCategory.feature}`);
    console.log(`  ❓ Questions: ${summary.byCategory.question}`);
    console.log(`  📝 Other: ${summary.byCategory.other}`);
    console.log(`\nBy Status:`);
    console.log(`  🆕 Open: ${summary.byStatus.open}`);
    console.log(`  👀 Under Review: ${summary.byStatus.under_review}`);
    console.log(`  🚧 In Progress: ${summary.byStatus.in_progress}`);
    console.log(`  ✅ Completed: ${summary.byStatus.completed}`);
    console.log(`  ❌ Won't Fix: ${summary.byStatus.wont_fix}`);
    console.log(`\n📦 Archived: ${summary.archived}`);
    console.log(`\n⚠️  Needs Response: ${summary.needsResponse.length}`);
    console.log(`\nTop Voted Items:`);
    summary.topVoted.slice(0, 5).forEach((item, i) => {
      console.log(`  ${i + 1}. [${item.voteCount} votes] ${item.title}`);
    });
    console.log('\nFull summary object:', summary);
  };

  window.showAllFeedback = async () => {
    const feedback = await feedbackReviewTool.getAllFeedback();
    console.log(`=== ALL FEEDBACK (${feedback.length} items) ===`);
    feedback.forEach((item) => {
      console.log(`\n[${item.category.toUpperCase()}] ${item.title}`);
      console.log(`  Status: ${item.status} | Votes: ${item.voteCount} | Comments: ${item.commentCount}`);
      console.log(`  User: ${item.user.name || 'Anonymous'}`);
      console.log(`  Created: ${new Date(item.created_at).toLocaleDateString()}`);
      if (item.archived) console.log(`  🗄️  ARCHIVED`);
    });
    console.log('\nFull feedback array:', feedback);
  };

  window.showNeedsAttention = async () => {
    const feedback = await feedbackReviewTool.getNeedingAttention();
    console.log(`=== FEEDBACK NEEDING ATTENTION (${feedback.length} items) ===`);
    feedback.forEach((item) => {
      console.log(`\n[${item.category.toUpperCase()}] ${item.title}`);
      console.log(`  Status: ${item.status} | Votes: ${item.voteCount}`);
      console.log(`  ${item.description.substring(0, 100)}...`);
      console.log(`  User: ${item.user.name || 'Anonymous'}`);
    });
    console.log('\nFull list:', feedback);
  };

  window.showBugs = async () => {
    const bugs = await feedbackReviewTool.getByCategory('bug');
    console.log(`=== BUG REPORTS (${bugs.length} items) ===`);
    bugs.forEach((item) => {
      console.log(`\n🐛 ${item.title}`);
      console.log(`  Status: ${item.status} | Votes: ${item.voteCount}`);
      console.log(`  ${item.description}`);
      if (item.image_url) console.log(`  📸 Screenshot: ${item.image_url}`);
    });
    console.log('\nFull bug list:', bugs);
  };

  window.showFeatureRequests = async () => {
    const features = await feedbackReviewTool.getByCategory('feature');
    console.log(`=== FEATURE REQUESTS (${features.length} items) ===`);
    features.forEach((item) => {
      console.log(`\n💡 ${item.title}`);
      console.log(`  Status: ${item.status} | Votes: ${item.voteCount}`);
      console.log(`  ${item.description}`);
    });
    console.log('\nFull feature list:', features);
  };

  console.log('✅ Feedback CLI Tools Loaded!');
  console.log('\nAvailable commands:');
  console.log('  showFeedbackSummary()  - High-level overview');
  console.log('  showAllFeedback()      - All feedback items');
  console.log('  showNeedsAttention()   - Items without admin response');
  console.log('  showBugs()             - All bug reports');
  console.log('  showFeatureRequests()  - All feature requests');
  console.log('\nDirect access:');
  console.log('  window.feedbackTool    - Full API access');
}

export {};
