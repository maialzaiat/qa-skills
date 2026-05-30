---
name: cypress-locator-extraction
description: "Locator extraction workflow and script usage for the Cypress automation framework. Use this skill whenever discovering, extracting, or validating CSS selectors or locators from a live website for use in Cypress tests. Trigger on requests like 'find selectors for this page', 'extract locators', 'what selector should I use', 'inspect this site', 'run the locator script', or any time live-site element discovery is needed before writing automation."
---

# Locator Extraction Workflow And Script Usage

## Locator Extraction Procedure

1. Ask the user for the website URL, credentials, login selectors or login steps, and the page or flow to inspect.
2. Confirm whether MFA, CAPTCHA, VPN, or IP restrictions could block automation.
3. Run either the bundled Playwright script [extract-cypress-locators.js](../scripts/extract-cypress-locators.js) or the Cypress helper spec [extract-cypress-locators.cy.js](../scripts/extract-cypress-locators.cy.js) with the provided inputs.
4. Review the generated candidate selectors and keep only stable, Cypress-friendly locators.
5. Prefer dedicated test attributes first, then stable ids, names, aria labels, and placeholders.
6. Reject brittle selectors based on index position, deep class chains, or transient styling hooks.
7. Store accepted locators in the framework's shared fixture or page object layer instead of leaving them in specs.

## Script Purpose

The bundled helpers inspect a live site, optionally perform login, inspect interactive elements, and write candidate Cypress-friendly selectors to a JSON output file. The Playwright script is better for generic website inspection. The Cypress helper is better when you want the discovery flow to run inside the same Cypress tooling already used by the project.

## Script Requirements

- The Playwright helper requires `playwright` to be installed in the current project.
- The Cypress helper requires `cypress` to be installed and runnable in the current project.
- The user must provide the website URL and the correct credentials.
- Login selectors or a precise login sequence must be known ahead of time.

## Example Commands

Run against a public page without login:

```powershell
node .github/skills/cypress-automation-framework/scripts/extract-cypress-locators.js --url https://example.com --target-selector "main" --output locator-candidates.json
```

Run against a login flow:

```powershell
node .github/skills/cypress-automation-framework/scripts/extract-cypress-locators.js --url https://example.com/login --username user@example.com --password secret --username-selector "#username" --password-selector "#password" --submit-selector "button[type='submit']" --post-login-selector "nav" --target-url https://example.com/account --target-selector "main" --output locator-candidates.json
```

Run the Cypress helper against a public page:

```powershell
npx cypress run --spec .github/skills/cypress-automation-framework/scripts/extract-cypress-locators.cy.js --env url=https://example.com,targetSelector=main,output=locator-candidates.json
```

Run the Cypress helper against a login flow:

```powershell
npx cypress run --spec .github/skills/cypress-automation-framework/scripts/extract-cypress-locators.cy.js --env url=https://example.com/login,username=user@example.com,password=secret,usernameSelector=#username,passwordSelector=#password,submitSelector=button[type='submit'],postLoginSelector=nav,targetUrl=https://example.com/account,targetSelector=main,output=locator-candidates.json
```

## Cypress Caveats

- Cypress locator extraction works best when the target flow is compatible with Cypress navigation and same-session interaction rules.
- Cross-origin auth flows, MFA, CAPTCHA, or browser-managed login windows may still be easier to inspect with Playwright.
- The Cypress helper is useful when you want locator discovery to stay inside the same runner and environment conventions as the automation project.

## Output Review Rules

- Keep only unique selectors.
- Prefer selectors based on `data-testid`, `data-test`, or `data-cy`.
- Use `id`, `name`, `aria-label`, or `placeholder` only when they are stable and unique.
- Treat the script output as candidate data, not final framework code.
- Normalize accepted selectors into fixtures or page objects before using them in Cypress specs.
