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
│   ├── cypress-automation.agent.md
│   └── QA-Reviewer.agent.md
│
└── skills/                                # Shared skill definitions (VS Code / Claude Code / Cursor)
    ├── ai-rca-manager/
    │   └── SKILL.md
    ├── cypress-automation-framework/
    │   ├── SKILL.md
    │   ├── references/
    │   │   ├── clean-code-standards.md
    │   │   ├── framework-structure.md
    │   │   ├── locator-extraction.md
    │   │   └── manual-test-case-conversion.md
    │   └── scripts/
    │       ├── extract-cypress-locators.cy.js
    │       └── extract-cypress-locators.js
    ├── create-bug-to-jira/
    │   └── SKILL.md
    └── generate-test-cases-from-jira/
        └── SKILL.md
```

---

## Agents

### `Cypress Automation`

**File:** [agents/cypress-automation.agent.md](agents/cypress-automation.agent.md)

Cypress automation specialist agent. Handles converting manual test cases to Cypress automation, and adding, updating, reviewing, refactoring, or debugging Cypress specs, page objects, fixtures, custom commands, email checks, database tasks, and state-machine flows in an existing framework.

**Triggers:** "manual test case to automation", "Cypress test", "page object", "fixture update", "support command", "flaky E2E", "email validation", "locator extraction", "automation framework cleanup".

---

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

Consolidated Cypress framework skill. Covers the full automation lifecycle — converting manual test cases, adding/updating/refactoring specs, extending page objects, managing fixtures and support commands, live-site locator extraction, email/database validation, and clean code review. Bundles four internal references and the locator extraction script.

| Reference                                                                                                       | Purpose                                                                     |
| --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [clean-code-standards.md](skills/cypress-automation-framework/references/clean-code-standards.md)               | Code quality rules and examples for specs, POMs, commands, and fixtures     |
| [framework-structure.md](skills/cypress-automation-framework/references/framework-structure.md)                 | Folder layout, layer ownership, and naming conventions                      |
| [locator-extraction.md](skills/cypress-automation-framework/references/locator-extraction.md)                   | Workflow and script usage for live-site selector discovery                  |
| [manual-test-case-conversion.md](skills/cypress-automation-framework/references/manual-test-case-conversion.md) | Step-by-step process for converting manual test cases to Cypress automation |

**Triggers:** "Cypress test", "page object", "fixture update", "support command", "flaky E2E", "email validation", "locator extraction", "automation framework cleanup", "convert this test case", "automate these steps", "is this good code", "where should I put this".

---

### `create-bug-to-jira`

**File:** [skills/create-bug-to-jira/SKILL.md](skills/create-bug-to-jira/SKILL.md)

Takes a failed test case, crafts a short descriptive Bug summary, builds a structured Jira description with Preconditions / Steps / Expected Result / Actual Result, and creates the Bug ticket via Atlassian MCP.

**Triggers:** A test failure pasted or described by the user, "log this bug", "create a Jira bug", "file a defect", or any failed test result with a Jira project key.

---

### `generate-test-cases-from-jira`

**File:** [skills/generate-test-cases-from-jira/SKILL.md](skills/generate-test-cases-from-jira/SKILL.md)

Fetches a Jira user story via Atlassian MCP, extracts acceptance criteria, and generates traceable manual and Jira-ready test cases with optional code/wiki evidence.

**Triggers:** Providing a Jira issue key (e.g. `PROJ-123`) or story URL, asking for test cases from a story, or wanting to publish cases back to Jira.

---

## Installation

**Option 1 — via npx (recommended):**

```bash
npx skills add maialzaiat/qa-skills
```

**Option 2 — manually:**

### GitHub Copilot (VS Code)

Copy the `skills/` and `agents/` folders into your project root. VS Code will auto-discover `.agent.md` files and skill `SKILL.md` files when using GitHub Copilot Chat in Agent mode.

### Claude Code

Copy each skill folder into your project under `.claude/skills/<skill-name>/` and ensure each folder contains a `SKILL.md` file. Restart the chat session.

### Cursor AI

Copy each skill folder into your project under `.cursor/skills/<skill-name>/` and ensure each folder contains a `SKILL.md` file. Reload the Cursor window.
