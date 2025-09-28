# AI Output Validation

Quality gates to verify AI-generated code before proceeding.

---

## Quick Quality Check

**After any AI code generation, run these 4 checks:**

### 1. Functionality Test
```bash
# Run relevant tests
npm test [specific-test-file]

# Or run all tests if small codebase
npm test
```
**Pass criteria**: All tests pass, no new failures

### 2. Code Standards
```bash
# Check linting
npm run lint

# Check formatting  
npm run format:check
```
**Pass criteria**: No linting errors, consistent formatting

### 3. Build Verification
```bash
# Verify project builds
npm run build
```
**Pass criteria**: Build completes without errors

### 4. Integration Check
```bash
# Start dev server
npm run dev

# Quick manual test of changed functionality
```
**Pass criteria**: Feature works as expected in browser/app

---

## Detailed Code Review

**Use when AI made significant changes (>50 lines)**

### Architecture Compliance
- [ ] Follows existing file structure patterns?
- [ ] Uses established naming conventions?
- [ ] Integrates properly with existing systems?
- [ ] Doesn't introduce unnecessary complexity?

### Code Quality
- [ ] Functions have single responsibility?
- [ ] Error handling is appropriate?
- [ ] Edge cases are considered?
- [ ] Performance implications are reasonable?

### Security & Safety
- [ ] Input validation where needed?
- [ ] No hardcoded secrets or credentials?
- [ ] Proper authentication/authorization checks?
- [ ] Database operations are safe?

**Scoring**: Must pass 80% of applicable checks

---

## AI Coordination Check

**When using both Claude Code + Copilot**

### Consistency Verification
- Compare AI suggestions if they conflict
- Check that implementations match architectural decisions
- Verify consistent error handling patterns
- Ensure unified code style

### Quality Arbitration
- Claude Code wins on: Architecture, security, performance
- Copilot wins on: Syntax, boilerplate, completion
- Human decides on: Business logic, UX decisions

---

## Rollback Criteria

**Immediately rollback AI changes if:**

❌ Tests fail and can't be quickly fixed  
❌ Build is broken  
❌ Introduces security vulnerability  
❌ Breaking changes to public APIs  
❌ Performance significantly degraded  
❌ Code is incomprehensible to team  

**Rollback command**: `git checkout -- [affected-files]`

---

## Acceptance Criteria

### ✅ Accept AI Changes When
- All quality checks pass
- Code follows project patterns
- Functionality works as specified
- No regressions introduced
- Team can understand and maintain it

### 📝 Accept with Notes
- Minor style inconsistencies (fix later)
- Missing edge case tests (add TODO)
- Performance could be better (note for optimization)

### ❌ Reject AI Changes When
- Fails quality checks
- Introduces technical debt
- Over-engineered solution
- Doesn't solve the actual problem
- Creates maintenance burden

---

**Remember**: It's faster to reject and retry than to fix broken AI output.