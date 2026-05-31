# Cypress Automation Framework — Usage Guide

This skill and its companion agent cover the full Cypress automation lifecycle: converting manual test cases, writing and maintaining specs, extending page objects, managing fixtures and support commands, and discovering locators from live sites.

---

## Two Entry Points

| Entry point | File                                           | Best for                                                                  |
| ----------- | ---------------------------------------------- | ------------------------------------------------------------------------- |
| **Skill**   | `skills/cypress-automation-framework/SKILL.md` | Claude Code · Cursor AI · any LLM that loads skills from the project tree |
| **Agent**   | `agents/cypress-automation.agent.md`           | GitHub Copilot Chat (VS Code) in **Agent** mode                           |

Both share the same scope, constraints, and working rules. The agent is a thin wrapper that invokes the skill's logic directly inside VS Code.

---

## When to Use the Skill vs. the Agent

Use the **skill** when you are working in Claude Code or Cursor and need the LLM to read, write, or refactor Cypress files based on the bundled references.

Use the **agent** when you are in VS Code Copilot Chat and want a conversational automation specialist that can run tools (`read`, `edit`, `search`, `execute`) and delegate exploration to the `Explore` sub-agent.

---

## Quick-Start Examples

### Convert a manual test case

```
@Cypress Automation convert this manual test case to Cypress:
  Given I am on the login page
  When I enter valid credentials
  Then I should see the dashboard
```

### Add a new spec for an existing flow

```
@Cypress Automation add a spec for the "forgot password" flow in the staging environment
```

### Extract locators from a live page

```
@Cypress Automation find selectors for the checkout page at https://example.com
```

> The agent will ask for the URL, credentials, and login sequence before starting.

### Review code quality

```
@Cypress Automation is this page object following clean code standards?
```

### Debug a flaky test

```
@Cypress Automation this spec is flaky — cypress/e2e/specs/checkout.cy.js
```

---

## Bundled References

The skill loads these documents on demand — you do not need to reference them manually:

| Reference                                                                     | When it is loaded                                                   |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [framework-structure.md](./references/framework-structure.md)                 | Deciding where new code belongs or understanding the project layout |
| [clean-code-standards.md](./references/clean-code-standards.md)               | Reviewing, writing, or refactoring any Cypress code                 |
| [locator-extraction.md](./references/locator-extraction.md)                   | Live-site selector discovery                                        |
| [manual-test-case-conversion.md](./references/manual-test-case-conversion.md) | Converting manual test cases or business flows to automation        |

---

## Locator Extraction Script

`scripts/extract-cypress-locators.js` — Node script that opens a page and outputs candidate CSS selectors.  
`scripts/extract-cypress-locators.cy.js` — Cypress spec variant of the same script for in-browser extraction.

Run from the project root:

```bash
node skills/cypress-automation-framework/scripts/extract-cypress-locators.js
```

The agent will guide you through running the correct variant once you provide the URL and credentials.

---

## Required Input for Live-Site Tasks

Before the agent or skill starts any locator discovery or live-site automation, it will ask for:

1. The website URL.
2. Valid credentials for the target environment.
3. The login selectors or a precise login sequence.
4. The target page or flow to inspect after login.
5. Any MFA, CAPTCHA, VPN, or IP restrictions.

---

## Layer Ownership Cheat-Sheet

| What you are changing                  | Owning layer                                  |
| -------------------------------------- | --------------------------------------------- |
| Selectors or localized UI text         | `cypress/fixtures`                            |
| Element access or verification helpers | `cypress/e2e/pages` (page object)             |
| Reusable multi-step flows              | `cypress/support/commands.js`                 |
| Scenario coverage                      | `cypress/e2e/specs`                           |
| DB tasks or email helpers              | `cypress/plugins` / `cypress.config.js` tasks |

---

## Validation Commands

```bash
# Full headless suite
npm test

# Interactive Cypress runner
npm run cy:open

# Single spec
npx cypress run --spec cypress/e2e/specs/<name>.cy.js

# Environment-specific run
npx cypress run --env environment=staging --spec cypress/e2e/specs/<name>.cy.js
```
