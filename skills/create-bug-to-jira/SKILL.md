---
name: create-bug-to-jira
description: Takes a failed test case, crafts a short descriptive Bug summary, builds a structured Jira description with Preconditions / Steps / Expected Result / Actual Result, and creates the Bug ticket via Atlassian MCP. Use when a test fails and the user wants to log it as a Jira Bug immediately.
user-invocable: true
---

# Create Bug to Jira from Failed Test Case

## When to use

- A test case has failed and the user wants to file a Bug in Jira
- The user pastes a failed test result, error log, or describes what went wrong

## Required inputs

| Input            | Notes                                                       |
| ---------------- | ----------------------------------------------------------- |
| Failed test case | Title, steps, expected vs actual result — paste or describe |
| Jira project key | e.g. `PROJ`, `QA`, `ESHOP`                                  |

## Optional inputs

- `cloudId` — site hostname or UUID; auto-resolved via `getAccessibleAtlassianResources` if missing
- Severity / Priority override — if user specifies (e.g. Critical, High)
- Assignee — Jira account ID or name; use `lookupJiraAccountId` to resolve
- Linked story or parent issue key — will be linked via `createIssueLink`

---

## Workflow

```
Task Progress:
- [ ] Gather failed test input and project key
- [ ] Resolve cloudId
- [ ] Confirm Bug issue type and required fields
- [ ] Draft summary and description; present for approval
- [ ] Create Bug ticket via createJiraIssue
- [ ] Link to parent/story if requested
- [ ] Report created ticket key and URL to user
```

---

### 1. Gather inputs

Ask for anything missing before proceeding:

1. If no project key is given, ask: _"Which Jira project should I log this bug under?"_
2. If neither test steps nor error output is provided, ask: _"Can you paste the test case steps, expected result, and what actually happened?"_
3. Do **not** ask about fields that can be inferred or are optional.

---

### 2. Resolve cloudId

1. Check if the user provided a site URL (e.g. `https://mycompany.atlassian.net`).
2. If not, call `getAccessibleAtlassianResources` and select the first matching cloud instance.
3. Store `cloudId` for all subsequent calls.

---

### 3. Confirm Bug issue type

1. Call `getJiraProjectIssueTypesMetadata` with the project key.
2. Locate the issue type named **"Bug"** (case-insensitive; fall back to "Defect" if Bug is absent).
3. Call `getJiraIssueTypeMetaWithFields` to identify required custom fields for that type.
4. Collect any missing required fields from the user before proceeding.

---

### 4. Draft the ticket — present before creating

#### 4a. Summary (title)

Write a **short, specific, actionable** summary following this pattern:

```
[Module/Feature] — <Observable failure in plain language>
```

Rules:

- Maximum ~80 characters
- Start with the module or feature name in brackets if identifiable
- Use present tense: _"fails"_, _"returns"_, _"displays"_ — not _"failed"_ or _"returned"_
- Include the key discriminating detail (e.g. specific input value, role, environment)
- Do **not** start with generic words like _"Bug:"_, _"Issue:"_, _"Test:"_

Good examples:

- `[Login] — "Forgot Password" link returns 404 for SSO users`
- `[Cart] — Discount code applies twice when user refreshes checkout page`
- `[API /orders] — POST returns 500 when item quantity is 0`

#### 4b. Description

Use this exact template:

```markdown
## Preconditions

- [List all setup requirements: environment, user role, data state, feature flags, etc.]

## Steps to Reproduce

1. [First action — be specific, include exact values used]
2. [Second action]
3. [Continue until the failure occurs]

## Expected Result

- [What should happen according to requirements or the test case design]

## Actual Result

- [What actually happened — include error messages, status codes, or observable UI behavior verbatim]

## Test Evidence

- Test case: [Name or ID of the failed test case if available]
- Environment: [e.g. Staging, Production, Local — state if unknown]
- Build / Version: [if available]
- Attachment: None

## Additional Context

[Any logs, stack traces, or relevant notes. Remove section if empty.]
```

Fill every section from the user's input. If a section is genuinely unknown, write `Unknown — to be investigated` rather than leaving it blank.

#### 4c. Present draft

Show the complete Summary and Description to the user before creating anything. Ask:

> _"Does this look correct? Should I create the bug in Jira?"_

Do not create the ticket until the user explicitly confirms.

---

### 5. Create the Bug ticket

After user confirmation, call `createJiraIssue` with:

```json
{
  "cloudId": "<resolved>",
  "projectKey": "<user provided>",
  "summary": "<drafted summary>",
  "issueType": "Bug",
  "description": {
    "type": "doc",
    "version": 1,
    "content": "<ADF-formatted description>"
  },
  "priority": "<user override or omit>",
  "assignee": "<resolved account ID or omit>"
}
```

> **ADF note:** Convert the markdown description to Atlassian Document Format (ADF) before sending. Use `heading` nodes for `##` sections and `bulletList` / `orderedList` nodes for lists.

Capture the returned issue key (e.g. `BUG-42`) and URL.

---

### 6. Link to parent issue (optional)

If the user provides a related story, epic, or parent key:

1. Call `getIssueLinkTypes` to find the appropriate link type (prefer _"is caused by"_ or _"relates to"_).
2. Call `createIssueLink` linking the new Bug to the parent issue.

---

## Response format

Return a concise confirmation message:

```
Bug created: [PROJ-123](https://site.atlassian.net/browse/PROJ-123)
Summary: [Login] — "Forgot Password" link returns 404 for SSO users
Attachment: screenshot.png uploaded ✓   ← or "No attachment"
Linked to: STORY-456 (relates to)       ← or omit if none
```

Then ask if anything else needs to be updated on the ticket.

---

## Safety rules

- **Never create the ticket without explicit user confirmation** of the draft.
- Never guess the project key — always confirm with the user if ambiguous.
- Never invent steps or failure details not provided by the user.
- If the attachment upload endpoint is unavailable, fall back to instructions for manual upload — do not silently skip.
- Do not set `Priority: Critical` or `Priority: Blocker` unless the user explicitly requests it.
