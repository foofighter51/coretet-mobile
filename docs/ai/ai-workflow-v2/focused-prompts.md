# Focused Task Prompts

Single-purpose prompts with clear success criteria.

---

## Feature Implementation

**Prompt**: Implement [FEATURE_NAME] by extending [EXISTING_COMPONENT]. Use existing patterns from [SIMILAR_FEATURE].

**Steps**:
1. Analyze [EXISTING_COMPONENT] structure
2. Identify integration points
3. Implement minimal viable version
4. Add basic tests
5. Verify no regressions

**Success**: Feature works, tests pass, no existing functionality broken.

---

## Bug Fix

**Prompt**: Fix [SPECIFIC_BUG] in [FILE:LINE]. Minimal change only.

**Steps**:
1. Reproduce the bug
2. Identify root cause
3. Apply smallest possible fix
4. Verify fix works
5. Check for similar issues

**Success**: Bug fixed, no side effects, solution is future-proof.

---

## Code Review

**Prompt**: Review [FILES] for quality, consistency, and potential issues.

**Check**:
- Follows existing patterns?
- Handles errors properly?
- Performance implications?
- Security considerations?
- Test coverage adequate?

**Success**: Clear go/no-go decision with specific improvement suggestions.

---

## Refactor

**Prompt**: Refactor [COMPONENT] for [REASON] without changing functionality.

**Rules**:
- Preserve all existing behavior
- Improve code organization only
- Extract reusable parts
- Add comments for complex logic
- Ensure tests still pass

**Success**: Code is cleaner, all tests pass, functionality identical.

---

## Debug Analysis

**Prompt**: Analyze [ERROR/ISSUE] and provide debugging strategy.

**Output**:
1. Likely root causes (ranked)
2. Diagnostic steps to verify each
3. Recommended investigation order
4. Quick fixes vs proper solutions

**Success**: Clear debugging roadmap with actionable next steps.

---

## Performance Optimization

**Prompt**: Optimize [SLOW_OPERATION] performance while maintaining functionality.

**Process**:
1. Measure current performance
2. Identify bottleneck
3. Propose optimization
4. Implement minimal change
5. Verify improvement

**Success**: Measurable performance gain, no functionality loss.

---

## Test Creation

**Prompt**: Create tests for [COMPONENT/FUNCTION] covering [SCENARIOS].

**Requirements**:
- Follow existing test patterns
- Cover happy path and edge cases
- Include error conditions
- Use descriptive test names
- Ensure tests are isolated

**Success**: Comprehensive test coverage, all tests pass, maintainable test code.

---

## Architecture Decision

**Prompt**: Evaluate approaches for [TECHNICAL_DECISION] considering [CONSTRAINTS].

**Analysis**:
- List 2-3 viable options
- Compare tradeoffs
- Consider future implications
- Recommend best choice
- Outline implementation plan

**Success**: Clear technical direction with justified reasoning.

---

*Each prompt should complete in 15-30 minutes max. If longer, break into smaller tasks.*