---
name: generate-test-cases-from-jira
description: Fetches a Jira user story via Atlassian MCP, extracts acceptance criteria, and generates traceable manual and Jira-ready test cases with optional code/wiki evidence. Use when the user provides a Jira key or URL, asks for test cases from a story, or wants to publish cases back to Jira.
user-invocable: true
---

# Generate Test Cases From Jira User Story

## When to use

- User gives a Jira issue key (e.g. `ESHOP-42`) or story URL
- User wants test cases derived from acceptance criteria
- User may want draft-only output or later Jira publish

For wiki-only or mixed sources without Jira, use [.github/skills/generate-test-cases/SKILL.md](../../.github/skills/generate-test-cases/SKILL.md).

## Required inputs

| Input            | Notes                                                           |
| ---------------- | --------------------------------------------------------------- |
| Story key or URL | e.g. `PROJ-123` or `https://site.atlassian.net/browse/PROJ-123` |
| Output mode      | `draft-only` (default), `jira-publish`, or `local-md-publish`   |

## Optional inputs

- `cloudId` — site hostname or UUID; resolve via `getAccessibleAtlassianResources` if missing
- Target module/flow — narrows code inspection (e.g. `auth`, `cart`)
- PR link — include diff/context in traceability
- Test case issue type name — required only for `jira-publish`
- Wiki path — supplemental detail when story is thin

## Workflow

```
Task Progress:
- [ ] Resolve cloudId and fetch story
- [ ] Extract scope and acceptance intent
- [ ] Add implementation evidence (code and/or wiki)
- [ ] Draft test cases with traceability
- [ ] Run quality gate
- [ ] Present draft; publish only after explicit approval
```

### 1. Fetch the user story

1. Read MCP tool schemas under `mcps/plugin-atlassian-atlassian/tools/` before calling.
2. Resolve `cloudId`: use user value, story URL hostname, or `getAccessibleAtlassianResources`.
3. Call `getJiraIssue` with `responseContentFormat: markdown` for the story key.
4. Capture: summary, description, acceptance criteria, labels, components, linked issues, comments that define scope.

### 2. Extract test intent

From the story, list explicitly:

- Primary user goal (happy path)
- Acceptance criteria → one or more scenarios each
- Roles, permissions, and data preconditions
- Validation and error rules stated or implied
- Out-of-scope items (do not test these)

If acceptance criteria are missing, state assumptions in the draft and flag them for the user.

### 3. Ground cases in evidence (recommended)

Cross-check implementation when the story maps to code in the current workspace:

| Layer                 | Where to look                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------- |
| API / backend         | Search for controller, service, DTO, and guard files related to the story's feature area |
| Endpoints / contracts | Look for API docs, OpenAPI/Swagger files, or wiki pages in the workspace                 |
| Requirements / wiki   | Search for module wiki pages or requirements docs linked from an index file              |
| Drift                 | If behavior may differ from docs, flag assumptions and ask the user to verify            |

> **Discovery rule:** Do not assume fixed paths. Use `file_search` or `semantic_search` to locate relevant source files based on the feature name extracted from the story summary. Ask the user if the workspace structure is unclear.

Each test case must cite **requirement evidence** (Jira field or AC text) and **implementation evidence** (file path or “not implemented — story-only”).

### 4. Write test cases

Produce **manual** cases and **Jira-ready** cases using this field mapping:

| Jira field  | Content                                                     |
| ----------- | ----------------------------------------------------------- |
| Summary     | Short, specific title                                       |
| Description | Sections: **Precondition**, **Steps**, **Expected results** |

Description template:

```markdown
**Precondition**

- [bulleted setup]

**Steps**

1. [ordered, executable actions]

**Expected results**

- [observable outcomes]

**Traceability**

- Story: [KEY] — [quote or AC reference]
- Evidence: [code path, wiki path, or PR]
```

### 5. Coverage minimum

Include at least:

- One happy path
- Validation failures where inputs exist
- Authorization failures where roles/permissions apply
- Highest-risk business edge called out in the story

Skip duplicate or low-value cases. Skip cases with no requirement anchor.

### 6. Quality gate

Before presenting the final draft or publishing, apply [.github/skills/generate-test-cases/reference/quality-gate-checklist.md](../../.github/skills/generate-test-cases/reference/quality-gate-checklist.md).

### 7. Output by mode

**`draft-only`** — Return the case list in chat. Do not create Jira issues.

**`local-md-publish`** — After user approval, write markdown beside the relevant wiki module or a path the user names. Use the same per-case structure as above.

**`jira-publish`** — After user approval:

1. Call `getJiraProjectIssueTypesMetadata` to find the test case issue type (e.g. "Test", "Test Case", "Story").
2. Call `getJiraIssueTypeMetaWithFields` to get required fields. **Resolve all field IDs by name — never hardcode `customfield_*` IDs.**
3. Dry-run preview of all cases → ask for explicit confirmation → call `createJiraIssue` per case → link each to the story via `createIssueLink`.
4. Never publish without recorded user confirmation.

## Response format

Return to the user:

1. **Story summary** — key, title, AC count
2. **Assumptions / gaps** — if any
3. **Test cases** — numbered table or list with Summary + full Description blocks
4. **Coverage map** — which AC each case satisfies
5. **Next step** — ask for approval before `jira-publish` or `local-md-publish`

## Safety

- Do not invent acceptance criteria not supported by the story or linked docs.
- Do not publish to Jira in `draft-only` mode.
- Do not guess required Jira custom fields; ask or read metadata first.

## References

- If the workspace has a broader test generation skill or quality gate checklist, locate it via `file_search` for `SKILL.md` or `quality-gate*` files and apply it before presenting the final draft.
