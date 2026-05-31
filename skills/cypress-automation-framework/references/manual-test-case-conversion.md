# Manual Test Case Conversion

## When To Load This Reference

- The user provides a manual test case, checklist, business scenario, or QA steps document.
- The task is to convert manual validation into automated Cypress coverage.
- The task needs test decomposition before code is written.

## Required Input

Before converting a manual test case, confirm these details:

- The exact manual steps.
- Preconditions and setup requirements.
- Expected results for each important checkpoint.
- Required test data.
- Environment, language, and account constraints.
- Whether the scenario should be one end-to-end spec or broken into smaller focused coverage.

## Conversion Procedure

1. Split the manual test case into preconditions, actions, assertions, and cleanup.
2. Remove purely human phrasing such as "observe" or "verify visually" and restate it as deterministic assertions.
3. Map each needed interaction to the correct framework layer:
   - selectors and text to fixtures
   - element access and verification helpers to page objects
   - repeated multi-step flows to custom commands
   - scenario intent to specs
4. Reuse existing support commands and page objects before creating new ones.
5. Replace manual data examples with shared factories or fixtures when the scenario allows it.
6. Keep one spec focused on one behavior or business path unless the framework already treats the full journey as a single tested flow.
7. Validate with the narrowest useful Cypress run.

## Good Conversion Example

Manual test case:

```text
1. Open the target page.
2. Enter a valid email address.
3. Click continue.
4. Verify the confirmation page is displayed.
```

Automation shape:

```javascript
it("navigates to the confirmation page after a valid submission", () => {
  const formData = generateFormData();

  cy.openTargetPage();
  cy.fillEmailField(formData.email);
  cy.submitForm();

  confirmationPage.getPageTitle().should("be.visible");
  cy.url().should("include", "/confirmation");
});
```

## Reject These Patterns

- Copying the manual test case sentence-by-sentence into one oversized spec.
- Leaving raw selectors in the spec while converting steps.
- Using hardcoded waits to mimic human pause timing.
- Using literal test data everywhere when the framework already has factories or fixtures.
- Writing assertions that cannot be checked deterministically.