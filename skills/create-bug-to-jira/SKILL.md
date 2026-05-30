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
- Linked test case key (e.g. `DEV-127`) — will be linked via the **Defect** link type (`created by` / `created`)

---

## Workflow

```
Task Progress:
- [ ] Gather failed test input and project key
- [ ] Resolve cloudId
- [ ] Confirm Bug issue type and required fields
- [ ] Fetch linked story/test case and extract acceptance criteria (if available)
- [ ] Infer severity and priority from AC + bug impact
- [ ] Draft summary and description; present for approval
- [ ] Create Bug ticket via createJiraIssue
- [ ] Link to parent/story if requested
- [ ] Link to test case via Defect link type if test case key is provided
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

### 3. Confirm Bug issue type and discover custom fields

1. Call `getJiraProjectIssueTypesMetadata` with the project key.
2. Locate the issue type named **"Bug"** (case-insensitive; fall back to "Defect" if Bug is absent). Store its `id`.
3. Call `getJiraIssueTypeMetaWithFields` with the Bug issue type ID to get all fields and their metadata.
4. From the returned field list, **resolve field IDs by name** — never hardcode `customfield_*` IDs:
   - Find the field whose `name` matches **"Severity"** (case-insensitive) → store as `severityFieldId` and note its `allowedValues`.
   - Find any `required: true` fields → collect values for these before creating.
   - Any other relevant custom fields (e.g. "Defect Classification", "Environment") → store by name.
5. If a required field has no default and cannot be inferred, ask the user for its value.

---

### 3b. Fetch linked story and extract acceptance criteria

This step runs **before** drafting. Its output feeds directly into severity and priority inference.

1. If the user provides a linked story / parent issue key, call `getJiraIssue` with that key.
2. Extract the following fields from the response:
   - **Acceptance criteria** — look in `description`, custom fields named `Acceptance Criteria`, or any field whose label contains _"acceptance"_ or _"AC"_.
   - **Story priority** — read the `priority` field of the parent story.
   - **Story labels / components** — may signal business criticality (e.g. `payments`, `auth`, `core-flow`).
3. If no story key is provided, skip this step and infer from the bug description alone.
4. Store the extracted AC text for use in step 4b.

> **If `getJiraIssue` fails or the story has no AC:** log a note "AC unavailable — inferring from bug description only" and continue.

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

#### 4b. Infer Severity and Priority

Use **both** the linked story's acceptance criteria (fetched in step 3b) **and** the bug description to determine Severity and Priority. Present them to the user as part of the draft review.

##### Step 1 — Read the acceptance criteria signals

Scan the AC text for indicators that raise or lower severity:

| AC signal (look for these phrases or patterns)                         | Implication                                          |
| ---------------------------------------------------------------------- | ---------------------------------------------------- |
| _"must"_, _"shall"_, _"critical path"_, _"required"_                   | Failing this AC → at least **High**                  |
| _"payment"_, _"checkout"_, _"login"_, _"authentication"_, _"security"_ | Business-critical context → **High** or **Critical** |
| _"should"_, _"expected to"_, _"ideally"_                               | Softer requirement → consider **Medium**             |
| _"nice to have"_, _"optionally"_, _"cosmetic"_, _"may"_                | Non-blocking → **Low**                               |
| AC is absent or story has no AC                                        | Fall back to bug-description inference only          |

**Also check:**

- Does the **failed AC item** cover the happy/core path, or an edge case?
  - Core / happy path failure → raise severity by one level if not already Critical.
  - Edge case failure → keep or lower by one level.
- Does the **parent story's priority** indicate business urgency?
  - Story priority Highest/High → floor the bug priority at **High** unless severity is Low.
  - Story priority Low → cap the bug priority at **Medium** unless severity is Critical.

##### Step 2 — Apply severity table

##### Severity — how badly does this break the system? (combine AC signals + bug impact)

| Severity     | Criteria (match any one)                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------- |
| **Critical** | System crash / data loss / security vulnerability / complete feature outage with no workaround |
| **High**     | Core business flow broken, no reasonable workaround, significant portion of users affected     |
| **Medium**   | Feature partially works, workaround exists, moderate user impact                               |
| **Low**      | Cosmetic defect, typo, minor UI misalignment, edge-case with negligible user impact            |

##### Step 3 — Apply priority table

##### Priority — how urgently must this be fixed? (combine AC signals + story priority)

| Priority    | Criteria (match any one)                                                           |
| ----------- | ---------------------------------------------------------------------------------- |
| **Highest** | Blocks release / blocks other team members' work / production is down right now    |
| **High**    | Affects a key user-facing flow for many users; should land in the current sprint   |
| **Medium**  | Notable impact but can be scheduled in the next sprint without serious consequence |
| **Low**     | Minor / cosmetic; can be deferred to backlog                                       |

**Decision rules:**

- If Severity = Critical → Priority defaults to **Highest** (unless overridden by user).
- If Severity = High → Priority defaults to **High**.
- If Severity = Medium → Priority defaults to **Medium**.
- If Severity = Low → Priority defaults to **Low**.
- Parent story priority acts as a **floor for Priority** when Severity ≥ High, and as a **cap** when Severity ≤ Medium (see Step 1 above).
- Always let an explicit user override win over the inferred value.
- If there is genuine ambiguity, pick the **lower** severity/priority and explain your reasoning in the draft.

##### Step 4 — Cite your reasoning

In the draft confirmation message, include a one-line rationale, e.g.:

> _Severity: High — AC item #2 ("User must be able to complete checkout") covers the core payment path and the bug fully breaks it. Priority: High — parent story STORY-45 is marked High priority._

This gives the user enough context to agree or correct the inference.

---

#### 4c. Description

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

#### 4d. Present draft

Show the complete Summary, Severity, Priority, and Description to the user before creating anything. Ask:

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
  "priority": "<inferred or user-overridden priority>",
  "assignee": "<resolved account ID or omit>"
}
```

> **Severity field:** After creating the issue, set the Severity custom field via `editJiraIssue`. Use the `severityFieldId` resolved in step 3 — **never hardcode the field ID**. Match the inferred severity value to the closest `allowedValues` entry from the field metadata:
>
> ```json
> { "<severityFieldId>": { "value": "<matched allowed value>" } }
> ```
>
> If the field is a numeric scale (e.g. 1–10), map Critical→9-10, High→7-8, Medium→4-6, Low→1-3 and pass the number directly.
> If no Severity field exists in the project, skip this step and record it in the response.

> **ADF note:** Convert the markdown description to Atlassian Document Format (ADF) before sending. Use `heading` nodes for `##` sections and `bulletList` / `orderedList` nodes for lists.

Capture the returned issue key (e.g. `BUG-42`) and URL.

---

### 6. Link to parent issue (optional)

If the user provides a related story, epic, or parent key:

1. Call `getIssueLinkTypes` to find the appropriate link type (prefer _"is caused by"_ or _"relates to"_).
2. Call `createIssueLink` linking the new Bug to the parent issue.

---

### 6b. Link to test case (optional)

If the user provides a test case key (issue type: Test), use the dedicated **Defect** link type:

1. Call `getIssueLinkTypes` and locate the link type named **"Defect"** (`inward: "created by"` / `outward: "created"`).
2. Call `createIssueLink` with:
   - `inwardIssue` = the test case key (e.g. `DEV-127`) — the test case _created_ the bug
   - `outwardIssue` = the new Bug key (e.g. `DEV-132`) — the bug _created by_ the test
   - `type` = `"Defect"`
3. This creates the semantic link: **DEV-127 created → DEV-132** / **DEV-132 created by → DEV-127**.

> **Note:** If the "Defect" link type is not available in the project, fall back to **"Relates"** and log a note.

---

## Response format

Return a concise confirmation message:

```
Bug created: [PROJ-123](https://site.atlassian.net/browse/PROJ-123)
Summary:  [Login] — "Forgot Password" link returns 404 for SSO users
Severity: High
Priority: High
Attachment: screenshot.png uploaded ✓   ← or "No attachment"
Linked to: STORY-456 (relates to)       ← or omit if none
Linked to: TEST-127 (created by)        ← Defect link type; or omit if no test case
```

Then ask if anything else needs to be updated on the ticket.

---

## Safety rules

- **Never create the ticket without explicit user confirmation** of the draft.
- Never guess the project key — always confirm with the user if ambiguous.
- Never invent steps or failure details not provided by the user.
- If the attachment upload endpoint is unavailable, fall back to instructions for manual upload — do not silently skip.
- Always show the inferred Severity and Priority to the user during draft review — never silently apply them.
- If the inferred severity/priority seems high (Critical/Highest), briefly explain the reasoning so the user can correct it.
