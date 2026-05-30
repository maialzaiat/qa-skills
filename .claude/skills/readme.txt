
## How to add these skills to your local machine

### Option 1: Add from a remote repo (recommended)

1. Open a terminal in your project root.
2. Run:

	```bash
	npx skills add maialzaiat/testing-skills
	```

3. Confirm the skills were added under `.claude/skills/`.

### Option 2: Add manually from local files

1. Copy each skill folder into your project at:

	`.claude/skills/<skill-name>/`

2. Make sure each folder contains a `SKILL.md` file.
3. Restart the chat session (or reload VS Code) so the agent picks up new skills.

### Verify installation

- Check that the folders exist in `.claude/skills/`.
- Ask the agent a prompt matching a trigger (for example: "convert this test case") and confirm the corresponding skill is loaded.
---

Here's a summary of the triggers for each skill:

---

**`cypress-automation-framework`** (main)
> Adding, updating, reviewing, refactoring, or debugging anything in the Cypress framework — specs, page objects, fixtures, commands, email checks, database tasks, flaky E2E, locator extraction, or manual test case conversion.

---

**`cypress-clean-code-standards`**
> Reviewing, writing, or refactoring Cypress code quality — "is this good code", "review my Cypress test", "clean up this spec", "refactor page object", or any code evaluation against framework standards.

---

**`cypress-framework-structure`**
> Deciding file placement, ownership, or project layout — "where should I put this", "what folder does this go in", "how is the project structured", "framework conventions".

---

**`cypress-locator-extraction`**
> Discovering selectors from a live website — "find selectors for this page", "extract locators", "what selector should I use", "inspect this site", "run the locator script".

---

**`cypress-manual-test-conversion`**
> Converting manual test steps into automation — "convert this test case", "automate these steps", "turn this into a Cypress test", "here are my manual test steps".

---

Want to adjust any of them? Triggers that are too broad can cause a skill to fire when it shouldn't, and triggers that are too narrow can cause it to be missed.

---

