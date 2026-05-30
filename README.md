# QA Skills

A collection of AI agent skills and custom agents for QA automation workflows — compatible with **GitHub Copilot (VS Code)**, **Claude Code**, and **Cursor AI**.

---

## Repository Structure

```
qa-skills/
├── CLAUDE.md                              # Knowledge wiki configuration for Claude Code
├── README.md                              # This file
│
├── agents/                                # GitHub Copilot agent definitions (VS Code)
│   └── QA-Reviewer.agent.md
│
└── skills/                                # Shared skill definitions (VS Code / Claude Code / Cursor)
    ├── ai-rca-manager/
    │   └── SKILL.md
    ├── cypress-automation-framework/
    │   └── SKILL.md
    ├── cypress-clean-code-standards/
    │   └── SKILL.md
    ├── cypress-framework-structure/
    │   └── SKILL.md
    ├── cypress-locator-extraction/
    │   └── SKILL.md
    ├── cypress-manual-test-conversion/
    │   └── SKILL.md
    ├── generate-test-cases-from-jira/
    │   └── SKILL.md
    └── create-bug-to-jira/
        └── SKILL.md
```

---

## Agents

### `QA-Reviewer`

**File:** [agents/QA-Reviewer.agent.md](agents/QA-Reviewer.agent.md)

Expert review agent for Playwright test automation and OrangeHRM logic. Reviews locator stability, POM integrity, wait strategies, and data management. Provides constructive feedback with "why" and "how" — does not modify code directly.

---

## Skills (`skills/`)

### `ai-rca-manager`

**File:** [skills/ai-rca-manager/SKILL.md](skills/ai-rca-manager/SKILL.md)

AI specialist in SRE and Lean Six Sigma Root Cause Analysis. Mines historical RCA tickets, scans Confluence, analyzes GitHub PRs, applies RCA frameworks (5 Whys, Fishbone/Ishikawa, Barrier Analysis, FMEA), generates SMART preventive actions, and creates a fully populated RCA Jira ticket.

**Triggers:** "RCA", "root cause", "post-mortem", "incident report", "blameless report", "why did this break", "analyze this bug", or a Jira Bug/Incident ID.

---

### `cypress-automation-framework`

**File:** [skills/cypress-automation-framework/SKILL.md](skills/cypress-automation-framework/SKILL.md)

Main Cypress framework skill. Use for adding, updating, reviewing, refactoring, or debugging anything in the Cypress framework — specs, page objects, fixtures, custom commands, email checks, database tasks, state-machine flows, and targeted Cypress runs.

**Triggers:** "Cypress test", "page object", "fixture update", "support command", "flaky E2E", "email validation", "locator extraction", "automation framework cleanup".

---

### `cypress-clean-code-standards`

**File:** [skills/cypress-clean-code-standards/SKILL.md](skills/cypress-clean-code-standards/SKILL.md)

Clean code standards and examples for the Cypress framework. Use when reviewing, writing, refactoring, or auditing Cypress code quality — specs, page objects, commands, and fixtures.

**Triggers:** "is this good code", "review my Cypress test", "clean up this spec", "refactor page object".

---

### `cypress-framework-structure`

**File:** [skills/cypress-framework-structure/SKILL.md](skills/cypress-framework-structure/SKILL.md)

Framework structure, conventions, and ownership rules. Use when deciding where to put new code, understanding the project layout, or determining which layer owns a selector or flow.

**Triggers:** "where should I put this", "what folder does this go in", "how is the project structured", "framework conventions".

---

### `cypress-locator-extraction`

**File:** [skills/cypress-locator-extraction/SKILL.md](skills/cypress-locator-extraction/SKILL.md)

Locator extraction workflow and script usage. Use when discovering, extracting, or validating CSS selectors from a live website for use in Cypress tests.

**Triggers:** "find selectors for this page", "extract locators", "what selector should I use", "inspect this site", "run the locator script".

---

### `cypress-manual-test-conversion`

**File:** [skills/cypress-manual-test-conversion/SKILL.md](skills/cypress-manual-test-conversion/SKILL.md)

Manual test case conversion workflow. Use when converting manual test cases, QA checklists, business scenarios, or step-by-step test documents into automated Cypress specs.

**Triggers:** "convert this test case", "automate these steps", "turn this into a Cypress test", "here are my manual test steps".

---

### `generate-test-cases-from-jira`

**File:** [skills/generate-test-cases-from-jira/SKILL.md](skills/generate-test-cases-from-jira/SKILL.md)

Fetches a Jira user story via Atlassian MCP, extracts acceptance criteria, and generates traceable manual and Jira-ready test cases with optional code/wiki evidence.

**Triggers:** Providing a Jira issue key (e.g. `PROJ-123`) or story URL, asking for test cases from a story, or wanting to publish cases back to Jira.

---

### `create-bug-to-jira`

**File:** [skills/create-bug-to-jira/SKILL.md](skills/create-bug-to-jira/SKILL.md)

Takes a failed test case, crafts a short descriptive Bug summary, builds a structured Jira description with Preconditions / Steps / Expected Result / Actual Result, and creates the Bug ticket via Atlassian MCP.

**Triggers:** "log this bug", "create a Jira bug", "test failed, file a ticket", "report this failure to Jira", or pasting a failed test result.

---

## Installation

Copy the desired skill folder(s) from `skills/` into your project under the path your AI tool expects:

| Tool                     | Path                                    |
| ------------------------ | --------------------------------------- |
| GitHub Copilot (VS Code) | `skills/<skill-name>/` in the workspace |
| Claude Code              | `.claude/skills/<skill-name>/`          |
| Cursor AI                | `.cursor/skills/<skill-name>/`          |

Each folder must contain a `SKILL.md` file. Restart the chat session or reload VS Code after copying.
