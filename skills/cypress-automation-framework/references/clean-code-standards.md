# Clean Code Standards And Examples

## Clean Code Gate

- Accept only clean, framework-aligned Cypress code.
- Reject code that duplicates selectors across specs and page objects.
- Reject hardcoded waits when the framework can assert on visible, enabled, loaded, or API-complete states.
- Reject copy-pasted flows when a reusable Cypress command or helper should own the behavior.
- Reject vague test names, mixed responsibilities, and large test bodies that hide intent.
- Reject inline test data sprawl when a shared factory or fixture should provide the values.
- Prefer small, readable helpers with one clear responsibility.

## Code Standards Examples

### Good: spec uses a page object and clear assertions

```javascript
it("shows the confirmation page after a valid submission", () => {
  const confirmationPage = new ConfirmationPage();

  cy.setupRequiredTestState();

  confirmationPage.getPageTitle().should("be.visible");
  confirmationPage.getSubmitButton().should("be.enabled");
});
```

### Avoid: spec owns selectors and timing hacks

```javascript
it("page state test", () => {
  cy.get(".page-content h2").should("exist");
  cy.wait(5000);
  cy.get("button").eq(3).click();
});
```

### Good: page object reads from shared fixture data

```javascript
getPageTitle() {
  return cy.get(this.fixture.page.title.selector);
}

verifyPageTitle() {
  this.getPageTitle().should("have.text", this.fixture.page.title.text);
}
```

### Avoid: duplicate selectors and text in code

```javascript
getPageTitle() {
  return cy.get(".page-container h2");
}

verifyPageTitle() {
  cy.get(".page-container h2").should("have.text", "Confirmation");
}
```

### Good: reusable command owns a repeated flow

```javascript
Cypress.Commands.add("fillInputForm", (formData, language = "en") => {
  const inputFormPage = new InputFormPage(language);

  inputFormPage.getFirstNameField().clear().type(formData.firstName);
  inputFormPage.getLastNameField().clear().type(formData.lastName);
  inputFormPage.getEmailField().clear().type(formData.email);
});
```

### Avoid: repeating the same flow in multiple specs

```javascript
cy.get("#firstName").type("Jane");
cy.get("#lastName").type("Doe");
cy.get("#email").type("jane@example.com");
```

### Good: generated data comes from a shared factory

```javascript
const formData = generateFormData({ emptyFields: ["email"] });
cy.fillInputForm(formData);
```

### Avoid: scattered inline data with no reuse

```javascript
cy.fillInputForm({
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
});
```
