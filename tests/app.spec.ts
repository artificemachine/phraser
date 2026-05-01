import { test, expect } from "@playwright/test";

/** Tauri runtime errors are expected when running in a browser without the Tauri backend. */
function isTauriRuntimeError(msg: string): boolean {
  return (
    msg.includes("__TAURI__") ||
    msg.includes("tauri") ||
    msg.includes("transformCallback") ||
    msg.includes("reading 'invoke'") ||
    msg.includes("reading 'platform'") ||
    msg.includes("error boundary")
  );
}

test.describe("phraser App — Smoke", () => {
  test("dev server responds with 200", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });

  test("page has valid html structure", async ({ page }) => {
    await page.goto("/");
    const html = await page.content();
    expect(html).toContain("<html");
    expect(html).toContain("<body");
    expect(html).toContain('<div id="root"');
  });

  test("page title is phraser", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("phraser");
  });
});

test.describe("phraser App — Branding", () => {
  test("no stale Parler references in page source", async ({ page }) => {
    await page.goto("/");
    const html = await page.content();
    expect(html).not.toContain(">Parler<");
    expect(html).not.toContain('"Parler"');
  });
});

test.describe("phraser App — Frontend Rendering", () => {
  test("root element exists", async ({ page }) => {
    await page.goto("/");
    const root = page.locator("#root");
    await expect(root).toBeAttached();
  });

  test("no console errors on load (excluding Tauri runtime)", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForTimeout(1000);

    const realErrors = errors.filter((e) => !isTauriRuntimeError(e));
    expect(realErrors).toEqual([]);
  });

  test("page loads without JavaScript errors (excluding Tauri runtime)", async ({
    page,
  }) => {
    const jsErrors: Error[] = [];
    page.on("pageerror", (error) => {
      if (!isTauriRuntimeError(error.message)) {
        jsErrors.push(error);
      }
    });

    await page.goto("/");
    await page.waitForTimeout(1000);
    expect(jsErrors).toEqual([]);
  });

  test("CSS assets are loaded", async ({ page }) => {
    const cssResponses: number[] = [];
    page.on("response", (response) => {
      if (response.url().includes(".css")) {
        cssResponses.push(response.status());
      }
    });
    await page.goto("/");
    await page.waitForTimeout(500);
    expect(cssResponses.every((s) => s === 200)).toBe(true);
  });

  test("JS assets are loaded without network errors", async ({ page }) => {
    const failedAssets: string[] = [];
    page.on("response", (response) => {
      const url = response.url();
      if (
        (url.includes(".js") || url.includes(".ts")) &&
        response.status() >= 400
      ) {
        failedAssets.push(`${response.status()} ${url}`);
      }
    });
    await page.goto("/");
    await page.waitForTimeout(500);
    expect(failedAssets).toEqual([]);
  });
});

test.describe("phraser App — i18n", () => {
  test("page language attribute is set", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(500);
    // The <html> element should have a lang attribute once i18n initializes
    const lang = await page.locator("html").getAttribute("lang");
    // lang is set by i18next after init — it should be a valid BCP 47 code
    expect(lang).toBeTruthy();
  });
});
