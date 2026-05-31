const buildLocatorCandidates = (documentObject) => {
  return Array.from(documentObject.querySelectorAll("body *"))
    .filter((element) => {
      const tag = element.tagName.toLowerCase();
      return (
        ["input", "button", "textarea", "select", "a"].includes(tag) ||
        element.getAttribute("role") !== null ||
        Boolean(element.dataset.testid) ||
        Boolean(element.dataset.test) ||
        Boolean(element.dataset.cy)
      );
    })
    .map((element) => {
      const tag = element.tagName.toLowerCase();
      const text = (element.innerText || element.textContent || "")
        .trim()
        .replaceAll(/\s+/g, " ")
        .slice(0, 120);
      const attributeDefinitions = [
        { type: "data-testid", value: element.dataset.testid, score: 1 },
        { type: "data-test", value: element.dataset.test, score: 2 },
        { type: "data-cy", value: element.dataset.cy, score: 3 },
        { type: "id", value: element.getAttribute("id"), score: 4 },
        { type: "name", value: element.getAttribute("name"), score: 5 },
        { type: "aria-label", value: element.getAttribute("aria-label"), score: 6 },
        { type: "placeholder", value: element.getAttribute("placeholder"), score: 7 },
      ];

      const candidates = attributeDefinitions
        .filter((definition) => Boolean(definition.value))
        .map((definition) => {
          const value = String(definition.value);
          const escapedId = typeof CSS !== "undefined" && CSS.escape
            ? CSS.escape(value)
            : value.replaceAll(/[^a-zA-Z0-9_-]/g, String.raw`\\$&`);
          const escapedAttributeValue = value.replaceAll('"', String.raw`\\"`);
          const selector = definition.type === "id"
            ? `#${escapedId}`
            : `[${definition.type}="${escapedAttributeValue}"]`;

          let matchCount = Number.POSITIVE_INFINITY;
          try {
            matchCount = documentObject.querySelectorAll(selector).length;
          } catch {
            matchCount = Number.POSITIVE_INFINITY;
          }

          return {
            type: definition.type,
            selector,
            unique: matchCount === 1,
            score: definition.score,
          };
        })
        .filter((candidate) => candidate.unique);

      const bestCandidate = candidates.toSorted(
        (left, right) => left.score - right.score,
      )[0] || null;

      return {
        tag,
        role: element.getAttribute("role"),
        type: element.getAttribute("type"),
        name: element.getAttribute("name"),
        id: element.getAttribute("id"),
        text,
        candidates,
        bestCandidate,
      };
    })
    .filter((entry) => entry.bestCandidate);
};

describe("Cypress Locator Extraction Helper", () => {
  it("collects candidate Cypress locators from the target page", () => {
    const url = Cypress.env("url");
    const output = Cypress.env("output") || "locator-candidates.json";
    const username = Cypress.env("username");
    const password = Cypress.env("password") || "";
    const usernameSelector = Cypress.env("usernameSelector");
    const passwordSelector = Cypress.env("passwordSelector");
    const submitSelector = Cypress.env("submitSelector");
    const postLoginSelector = Cypress.env("postLoginSelector");
    const targetUrl = Cypress.env("targetUrl");
    const targetSelector = Cypress.env("targetSelector");

    expect(url, "Cypress env 'url' is required").to.be.a("string").and.not.be.empty;

    cy.visit(url);

    if (username && usernameSelector && passwordSelector) {
      cy.get(usernameSelector).clear().type(username, { log: false });
      cy.get(passwordSelector).clear().type(password, { log: false });

      if (submitSelector) {
        cy.get(submitSelector).click();
      }

      if (postLoginSelector) {
        cy.get(postLoginSelector).should("be.visible");
      }
    }

    if (targetUrl) {
      cy.visit(targetUrl);
        scannedUrl: documentObject.location.href,
        extractedAt: new Date().toISOString(),
        source: "cypress",
        candidates,
      };

      cy.writeFile(output, outputPayload);
      cy.log(`Saved ${candidates.length} locator candidates to ${output}`);
    });
  });
});