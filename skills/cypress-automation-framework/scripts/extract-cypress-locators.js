#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

function requireArg(args, key) {
  if (!args[key]) {
    throw new Error(`Missing required argument --${key}`);
  }
}

async function loadPlaywright() {
  try {
    return require("playwright");
  } catch {
    throw new Error(
      "The script requires the 'playwright' package. Install it in the current project with 'npm install -D playwright'.",
    );
  }
}

function buildOutputPath(customOutput) {
  if (customOutput) {
    return path.resolve(process.cwd(), customOutput);
  }

  return path.resolve(process.cwd(), "locator-candidates.json");
}

async function loginIfRequested(page, args) {
  if (
    !args["username-selector"] ||
    !args["password-selector"] ||
    !args.username
  ) {
    return;
  }

  await page.locator(args["username-selector"]).fill(args.username);
  await page.locator(args["password-selector"]).fill(args.password || "");

  if (args["submit-selector"]) {
    await page.locator(args["submit-selector"]).click();
  }

  if (args["post-login-selector"]) {
    await page
      .locator(args["post-login-selector"])
      .waitFor({ state: "visible" });
  } else if (args["post-login-url"]) {
    await page.waitForURL(new RegExp(args["post-login-url"]));
  } else {
    await page.waitForLoadState("networkidle");
  }
}

async function collectLocatorCandidates(page) {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll("body *"))
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
          {
            type: "aria-label",
            value: element.getAttribute("aria-label"),
            score: 6,
          },
          {
            type: "placeholder",
            value: element.getAttribute("placeholder"),
            score: 7,
          },
        ];

        const candidates = attributeDefinitions
          .filter((definition) => Boolean(definition.value))
          .map((definition) => {
            const value = String(definition.value);
            const escapedId =
              typeof CSS !== "undefined" && CSS.escape
                ? CSS.escape(value)
                : value.replaceAll(/[^a-zA-Z0-9_-]/g, String.raw`\\$&`);
            const escapedAttributeValue = value.replaceAll(
              '"',
              String.raw`\\"`,
            );
            let selector = "";

            if (definition.type === "id") {
              selector = `#${escapedId}`;
            } else {
              selector = `[${definition.type}="${escapedAttributeValue}"]`;
            }

            let matchCount = Number.POSITIVE_INFINITY;
            try {
              matchCount = document.querySelectorAll(selector).length;
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

        const bestCandidate =
          candidates.toSorted((left, right) => left.score - right.score)[0] ||
          null;

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
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  requireArg(args, "url");

  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ headless: !args.headed });
  const page = await browser.newPage();

  try {
    await page.goto(args.url, { waitUntil: "domcontentloaded" });
    await loginIfRequested(page, args);

    if (args["target-url"]) {
      await page.goto(args["target-url"], { waitUntil: "domcontentloaded" });
    }

    if (args["target-selector"]) {
      await page.locator(args["target-selector"]).waitFor({ state: "visible" });
    }

    const candidates = await collectLocatorCandidates(page);
    const output = {
      scannedUrl: page.url(),
      extractedAt: new Date().toISOString(),
      candidates,
    };

    const outputPath = buildOutputPath(args.output);
    fs.writeFileSync(
      outputPath,
      `${JSON.stringify(output, null, 2)}\n`,
      "utf8",
    );
    console.log(
      `Saved ${candidates.length} locator candidates to ${outputPath}`,
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
