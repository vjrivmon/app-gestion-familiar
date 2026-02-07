---
name: product-clarify
description: This skill should be used when processing GitHub issues that have the 'product-clarify' label. It reads the issue, asks clarifying product questions (user impact, acceptance criteria, edge cases), and based on the complexity assessment either implements the change directly with a PR to develop branch, or adds the 'development-needed' label for developer evaluation.
---

# Product Clarify

## Overview

This skill processes GitHub issues that need product clarification before implementation. It guides through a structured questioning process to fully understand requirements, then routes the issue appropriately based on complexity.

## Workflow

### Step 1: Read the GitHub Issue

To begin, fetch the issue details from GitHub:

```bash
gh issue view <issue-number> --json title,body,labels,assignees,comments
```

Extract and analyze:
- Issue title and description
- Current labels
- Any existing comments or context
- Referenced files or components

### Step 2: Ask Clarifying Questions

Engage in a structured clarification dialogue covering three key areas:

#### User Impact & Scope
- Who is affected by this issue/feature?
- How widespread is the impact (all users, specific segment, internal only)?
- What is the current user experience vs. expected experience?
- What is the business priority or urgency?

#### Acceptance Criteria
- What does "done" look like for this issue?
- What are the specific requirements that must be met?
- Are there any non-functional requirements (performance, security)?
- How will success be measured?

#### Edge Cases & Boundaries
- What happens in error scenarios?
- Are there any boundary conditions to consider?
- What integrations or dependencies are involved?
- Are there any constraints or limitations to be aware of?

Use the AskUserQuestion tool to gather this information interactively. Ask 2-3 questions at a time to avoid overwhelming the user.

### Step 3: Document Clarifications

After gathering information, summarize the clarified requirements:

1. **Problem Statement**: Clear description of the issue
2. **Acceptance Criteria**: Bullet list of specific requirements
3. **Scope**: What's included and explicitly excluded
4. **Edge Cases**: Known boundary conditions and error handling
5. **Dependencies**: Related systems or components

### Step 4: Assess Complexity

Present the complexity assessment to the user for final decision:

**Indicators of a SIMPLE change (can implement directly):**
- Single file modification
- Configuration or text change
- Minor UI adjustment
- Bug fix with clear solution
- No architectural decisions needed
- No new dependencies required

**Indicators of a COMPLEX change (needs developer evaluation):**
- Multiple interconnected files
- Database schema changes
- New API endpoints
- Architectural decisions required
- Security implications
- Performance considerations
- New third-party integrations

Ask the user: "Based on this analysis, should this be implemented directly or routed to development?"

### Step 5A: Simple Change - Implement Directly

1. **Update issue labels**:
   ```bash
   gh issue edit <issue-number> --remove-label "product-clarify" --add-label "development-ready"
   ```

2. **Add clarification summary as comment**:
   ```bash
   gh issue comment <issue-number> --body "$(cat <<'EOF'
   ## Product Clarification Complete

   ### Problem Statement
   <Clear description>

   ### Acceptance Criteria
   - <Criterion 1>
   - <Criterion 2>

   ### Scope
   **Included:**
   - <Item 1>

   **Excluded:**
   - <Item 1>

   ### Edge Cases
   - <Edge case 1>

   ### Complexity Assessment
   This issue requires developer evaluation due to:
   - <Reason 1>
   - <Reason 2>

   ---
   🤖 Clarified with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```

### Step 5B: Complex Change - Route to Development

If the change requires developer evaluation:

1. **Update issue labels**:
   ```bash
   gh issue edit <issue-number> --remove-label "product-clarify" --add-label "development-needed"
   ```

2. **Add clarification summary as comment**:
   ```bash
   gh issue comment <issue-number> --body "$(cat <<'EOF'
   ## Product Clarification Complete

   ### Problem Statement
   <Clear description>

   ### Acceptance Criteria
   - <Criterion 1>
   - <Criterion 2>

   ### Scope
   **Included:**
   - <Item 1>

   **Excluded:**
   - <Item 1>

   ### Edge Cases
   - <Edge case 1>

   ### Complexity Assessment
   This issue requires developer evaluation due to:
   - <Reason 1>
   - <Reason 2>

   ---
   🤖 Clarified with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```

## Repository Configuration

This skill is configured for the **gurusup/gurusup_monorepo** repository. All GitHub CLI commands operate on this repository by default.

## Resources

This skill does not require bundled scripts, references, or assets. All functionality is achieved through:
- GitHub CLI (`gh`) for issue and PR management
- Git for version control and worktree management
- Standard Claude Code tools for file editing
