import { expect, test, type Page } from "@playwright/test";

/** Load a page and wait until React has hydrated (ModalProvider sets html[data-ready]). */
async function open(page: Page, path = "/") {
  await page.goto(path);
  await page.locator("html[data-ready]").waitFor({ state: "attached" });
}

/** True when /api/health reports the database up (DB-backed flows are skipped otherwise). */
async function databaseUp(page: Page) {
  const res = await page.request.get("/api/health");
  return res.ok();
}

test.describe("landing page", () => {
  test("renders every POC section with its anchor id", async ({ page }) => {
    await open(page);
    await expect(page).toHaveTitle(/TrustedtrAiner — Become Trusted With AI/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("DON'T JUST USE AI.");
    for (const id of ["top", "signal", "programs", "method", "outcomes", "employers", "spatial-testimonials"]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test("clicking a program card opens Apply with that track preselected", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page);
    await page.locator(".program-card", { hasText: "AI Leadership" }).getByRole("heading").click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Start your AI career move." })).toBeVisible();
    await expect(dialog.getByRole("combobox")).toHaveValue("AI Leadership");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("program cards work from the keyboard", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard only");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page);
    const apply = page.getByRole("button", { name: "Apply for AI Practitioner" });
    await apply.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("combobox")).toHaveValue("AI Practitioner");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(apply).toBeFocused(); // Radix returns focus to the trigger
  });

  test("method portal opens, rotates and closes", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page);
    await page.getByRole("button", { name: "Open 3D Academy Portal" }).click();
    const dialog = page.getByRole("dialog", { name: "How the academy works" });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(".portal-card.active h3")).toHaveText("LEARN WITH SIGNAL");
    await dialog.getByRole("button", { name: "Next card" }).click();
    await expect(dialog.locator(".portal-card.active h3")).toHaveText("BUILD UNDER PRESSURE");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("reduced motion shows the standard (non-cinematic) page", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page);
    await expect(page.locator("html")).not.toHaveClass(/cine/);
    await page.locator('a[href="/#outcomes"]').first().click();
    await expect(page.locator("#outcomes")).toBeInViewport();
  });

  test("cinematic mode turns off on the first Tab press", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard only");
    await open(page);
    await expect(page.locator("html")).toHaveClass(/cine/);
    await page.keyboard.press("Tab");
    await expect(page.locator("html")).not.toHaveClass(/cine/);
  });

  test("legal pages and 404", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { level: 1, name: "Privacy policy" })).toBeVisible();
    await page.goto("/terms");
    await expect(page.getByRole("heading", { level: 1, name: "Terms of use" })).toBeVisible();
    const res = await page.goto("/definitely-not-a-page");
    expect(res?.status()).toBe(404);
    await expect(page.getByText("didn’t make the cohort.")).toBeVisible();
  });
});

test.describe("lead capture (needs the database)", () => {
  test("apply flow saves a lead", async ({ page }) => {
    test.skip(!(await databaseUp(page)), "database not configured");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page);
    await page.getByRole("button", { name: "Apply now" }).first().click();
    const dialog = page.getByRole("dialog");
    await dialog.getByPlaceholder("Alex Morgan").fill("E2E Tester");
    await dialog.getByPlaceholder("alex@company.com").fill(`e2e+${Date.now()}@example.com`);
    await dialog.getByRole("button", { name: /request my roadmap/i }).click();
    await expect(dialog.getByRole("heading", { name: "You’re on the list." })).toBeVisible({ timeout: 20_000 });
  });

  test("assessment recommends a track and leads into Apply", async ({ page }) => {
    test.skip(!(await databaseUp(page)), "database not configured");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page);
    await page.getByRole("button", { name: "Free assessment" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: /every day/i }).click();
    await dialog.getByRole("button", { name: /lead ai strategy/i }).click(); // 2 + 2 + 1 = 5 → AI Leadership
    await dialog.getByRole("button", { name: /comfortable with tools/i }).click();
    await expect(dialog.getByRole("heading", { name: "AI Leadership" })).toBeVisible({ timeout: 20_000 });
    await dialog.getByRole("button", { name: /reserve a conversation/i }).click();
    await expect(page.getByRole("dialog").getByRole("combobox")).toHaveValue("AI Leadership");
  });
});
