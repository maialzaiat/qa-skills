---
name: cypress-clean-code-standards
description: "Clean code standards and examples for the Cypress automation framework. Use this skill whenever reviewing, writing, refactoring, or auditing Cypress code quality — including specs, page objects, commands, and fixtures. Trigger on requests like 'is this good code', 'review my Cypress test', 'clean up this spec', 'refactor page object', or any time Cypress code needs to be evaluated or improved against framework standards."
---

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
it("shows the payment summary for a valid cart", () => {
  const paymentPage = new PaymentPage("de");

  cy.completeCheckoutFlow({ language: "de" });

  paymentPage.getSummaryTitle().should("be.visible");
  paymentPage.getSubmitButton().should("be.enabled");
});
```

### Avoid: spec owns selectors and timing hacks

```javascript
it("payment test", () => {
  cy.get(".summary > h2").should("exist");
  cy.wait(5000);
  cy.get("button").eq(3).click();
});
```

### Good: page object reads from shared fixture data

```javascript
getSummaryTitle() {
  return cy.get(this.fixture.summary.title.selector);
}

verifySummaryTitle() {
  this.getSummaryTitle().should("have.text", this.fixture.summary.title.text);
}
```

### Avoid: duplicate selectors and text in code

```javascript
getSummaryTitle() {
  return cy.get(".checkout-summary h2");
}

verifySummaryTitle() {
  cy.get(".checkout-summary h2").should("have.text", "Order summary");
}
```

### Good: reusable command owns a repeated flow

```javascript
Cypress.Commands.add("fillAddressForm", (addressData, language = "de") => {
  const addressPage = new AddressPage(language);

  addressPage.getFirstNameField().clear().type(addressData.firstName);
  addressPage.getLastNameField().clear().type(addressData.lastName);
  addressPage.getEmailField().clear().type(addressData.email);
});
```

### Avoid: repeating the same flow in multiple specs

```javascript
cy.get("#firstName").type("Amina");
cy.get("#lastName").type("Keller");
cy.get("#email").type("amina@example.com");
```

### Good: generated data comes from a shared factory

```javascript
const addressData = generateAddressData({ emptyFields: ["email"] });
cy.fillAddressForm(addressData, "de");
```

### Avoid: scattered inline data with no reuse

```javascript
cy.fillAddressForm(
  {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
  },
  "de",
);
```
