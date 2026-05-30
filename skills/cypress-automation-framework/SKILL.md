---
name: cypress-automation-framework
description: "Use when converting manual test cases to Cypress automation or when adding, updating, reviewing, refactoring, or debugging Cypress automation in an existing framework: specs, page objects, fixtures, custom commands, email checks, database tasks, state-machine flows, clean code standards, and targeted Cypress runs. Trigger on requests like manual test case to automation, Cypress test, page object, fixture update, support command, flaky E2E, email validation, locator extraction, or automation framework cleanup."
argument-hint: "Describe the manual test case or flow, website URL, login credentials, login selectors or steps, target page, languages, environment, and whether validation should run."
user-invocable: true
---

# Cypress Automation Framework

## When to Use

- Add or update Cypress specs in `cypress/e2e/specs`.
- Extend page objects in `cypress/e2e/pages`.
- Update selector or localized text fixtures in `cypress/fixtures`.
- Modify reusable flows in support command layers such as `cypress/support/commands.js`.
- Work on environment-aware navigation, email verification, or database-backed assertions.
- Discover candidate Cypress-compatible locators from a live website by using the bundled [locator extraction script](./scripts/extract-cypress-locators.js).
- Convert manual test cases into clean Cypress automation.

## Companion Skills — Load When Needed

These are standalone skills. Load them by reading their SKILL.md when the task requires their guidance:

| Task | Skill to load |
|---|---|
| Reviewing, writing, or refactoring Cypress code quality | `cypress-clean-code-standards` |
| Deciding file placement, ownership, or project layout | `cypress-framework-structure` |
| Discovering selectors from a live website | `cypress-locator-extraction` |
| Converting manual test steps into Cypress automation | `cypress-manual-test-conversion` |

## Required Input

Before using this skill for live-site locator discovery, ask the user for:

- The website URL to open.
- Valid credentials for the target environment.
- The login selectors or a precise login sequence, because login pages are project-specific.
- The target page or flow to inspect after login.
- Any MFA, CAPTCHA, VPN, or IP restrictions that could block automation.

Do not start locator extraction until the user provides the URL and the required login details.

## Editing Procedure

1. Identify the owning layer before editing: fixture, page object, support command, spec, or plugin.
2. Load `cypress-manual-test-conversion` skill when the input starts from a manual scenario, business flow, or test steps document.
3. Load `cypress-framework-structure` skill when you need ownership rules or expected project layout.
4. Load `cypress-clean-code-standards` skill before accepting, reviewing, or rewriting Cypress code.
5. Load `cypress-locator-extraction` skill before doing live-site locator discovery.
6. Make the smallest change that fits the framework already in the repo.
7. Validate with the narrowest useful command.

## Targeted Validation

- Run the full headless suite: `npm test`
- Run headless explicitly: `npm run cypress run --headless`
- Open Cypress interactively: `npm run cy:open`
- Run a single spec headless: `npx cypress run --headless --spec cypress/e2e/specs/<n>.cy.js`
- Run an environment-specific spec with the project's script or explicit `--env` flags.
- Pass an environment explicitly when the project uses env-driven routing or data.

## Practical Checks

- If you add UI text assertions, confirm the matching locale-specific text values exist.
- If you add a new field interaction, update the page object and any command helper that should reuse it.
- If you add DB-backed validation, confirm the task already exists in config or extend the existing task pattern.
- If you add email coverage, keep subject and body validation localized and aligned with the project's email helper or page object layer.
