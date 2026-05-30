---
name: cypress-framework-structure
description: "Framework structure, conventions, and ownership rules for the Cypress automation framework. Use this skill whenever planning where to put new code, understanding the project layout, deciding which layer owns a selector or flow, or onboarding to the framework. Trigger on requests like 'where should I put this', 'what folder does this go in', 'how is the project structured', 'framework conventions', or any time ownership or file placement decisions are needed."
---

# Framework Structure And Conventions

## Common Project Map

- `cypress/e2e/pages`: page objects, often language-aware and fixture-driven.
- `cypress/e2e/specs`: feature specs, commonly named `*.cy.js`.
- `cypress/e2e/factory/dataFactory.js`: generated test data using Faker or a similar generator.
- `cypress/fixtures`: selectors and localized text, often with language-specific keys.
- `cypress/support/constants.js`: environments, URLs, pages, languages, and route helpers.
- `cypress/support/commands.js`: composable flow helpers built on page objects.
- `cypress/support/emailCommands.js`: optional email-provider inbox and email validation helpers.
- `cypress/plugins/database.js`: optional database-backed Cypress tasks.

## Core Conventions

1. Specs should express scenarios, not own selectors. If a selector is needed, place it in a fixture and access it through a page object.
2. Page objects should stay close to the current pattern: constructor language input, fixture-backed selectors, getters, and focused verification helpers.
3. Fixtures should store localized UI copy and selectors together so all supported locales stay synchronized.
4. Repeated user flows belong in reusable Cypress commands instead of being copied into multiple specs.
5. Generated form data should come from a shared factory function, not from scattered literals.
6. Environment handling should remain centralized through shared constants or helpers and existing env-driven run patterns.
7. Email and database checks should reuse the project's current email helpers and registered `cy.task(...)` integrations before adding new plumbing.
8. Where flow ordering matters, respect the project's existing state-machine or flow-guard conventions.

## Ownership Rules

- Put selectors and localized text in shared fixtures when the framework uses fixture-backed UI metadata.
- Put element getters and focused verification helpers in page objects.
- Put repeated multi-step behaviors in custom Cypress commands or shared helpers.
- Put scenario intent and assertions in specs, not selector plumbing.
- Put generated inputs in shared factories, not duplicated literals across tests.
