<user_request>
#$ARGUMENTS
<user_request>

At the end of this message, I will ask you to do something. Please follow the "Create session file, Explore, Clarification, Team Selection, Plan, Advice, Update, Iterate, Diagram flow" workflow when you start over the user_request.

# Steps
## 1. Create the session file
Create `.claude/sessions/context_session_{feature_name}.md` where plan is going to be updated with all the future iterations and feedback

## 2. Explore
First, explore the relevant files in the repository

## 3. Clarification
Use AskUserQuestion tool about anything unclear giving the posible solutions:
- User scenarios
- Edge cases  
- Integration requirements
- Performance needs
- Dependencies
- Implementations

IMPORTANT Wait for my answers before continuing.

## 4. Team Selection (parallel execution if posible)
Select what subagents are going to be involved in the future advice phase, dont invoque them only let me know who are you going to ask advice and for what

## 5. Plan
Next, think hard and write up a detailed implementation plan in phases. Don't forget to include tests, lookbook components, documentation and success signal (How we know it's done). Use your judgement as to what is necessary, given the standards of this repo.

If there are things you still do not understand or questions you have for the user, pause here to ask them before continuing.

## 6. Advice
Use in parallel the subagents needed to get knowledge and advice over the plan to get a complete implementation

If there are things you are not sure about, use parallel subagents to do some web research. They should only return useful information, no noise.

## 7. Update
Update the context_session file with the final plan

## 8. Iterate
Evaluate the plan and iterate over it until have the final plan with the solution asking to the user if there is something missing

## 9. Create at the end of `.claude/sessions/context_session_{feature_name}.md` a section with the UML sequence diagrams in ASCI for each flow that is going to be generated

## 10. Solution Detail

### Core Capabilities (MoSCoW)

| Priority | Capability | Rationale |
|----------|------------|-----------|
| Must | {Feature} | {Why essential} |
| Must | {Feature} | {Why essential} |
| Should | {Feature} | {Why important but not blocking} |
| Could | {Feature} | {Nice to have} |
| Won't | {Feature} | {Explicitly deferred and why} |

## 11. Implementation Phases checklist
Add always at the end a checklist like this one
<!--
  STATUS: pending | in-progress | complete
  PARALLEL: phases that can run concurrently (e.g., "with 3" or "-")
  DEPENDS: phases that must complete first (e.g., "1, 2" or "-")
-->

| # | Phase | Description | Status | Parallel | Depends |
|---|-------|-------------|--------|----------|---------|
| 1 | {Phase name} | {What this phase delivers} | pending | - | - |
| 2 | {Phase name} | {What this phase delivers} | pending | - | 1 |
| 3 | {Phase name} | {What this phase delivers} | pending | with 4 | 2 |
| 4 | {Phase name} | {What this phase delivers} | pending | with 3 | 2 |
| 5 | {Phase name} | {What this phase delivers} | pending | - | 3, 4 |

### Parallelism Notes

{Explain which phases can run in parallel and why, e.g., "Phases 3 and 4 can run in parallel in separate worktrees as they touch different domains (frontend vs auth)"}

## 12. Validation Status

| Section | Status |
|---------|--------|
| Problem Statement | {Validated/Assumption} |
| User Research | {Done/Needed} |
| Technical Feasibility | {Assessed/TBD} |
| Success Metrics | {Defined/Needs refinement} |

## 13. Open Questions ({count})

Use the took AskUserQuestionTool for the open questions that need answers and update the plan with that feedback
---

#RULES
The target of this session is to create the plan DON'T implement it