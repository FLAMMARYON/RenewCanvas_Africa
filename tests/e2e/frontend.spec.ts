import { expect, test, type Page } from "@playwright/test";
import { join } from "node:path";

const axePath = join(process.cwd(), "node_modules", "axe-core", "axe.min.js");

test("buyer can complete the frontend-only checkout journey", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: "Contact & Delivery Details" })).toBeVisible();

  await page.getByLabel("Full Name").fill("Amina Buyer");
  await page.getByLabel("Email Address").fill("amina@example.com");
  await page.getByLabel("Phone / WhatsApp").fill("+250788000000");
  await page.getByLabel("Delivery Address").fill("Kigali Innovation Village");
  await page.getByLabel("City").fill("Kigali");
  await page.getByRole("button", { name: /continue to payment/i }).click();
  await page.getByRole("button", { name: /review order/i }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /place order/i }).click();

  await expect(page).toHaveURL(/\/order-confirmation\?order=ORD-/);
  const latestOrder = await page.evaluate(() => window.localStorage.getItem("renewcanvas.latestOrder"));
  const orders = await page.evaluate(() => window.localStorage.getItem("renewcanvas.orders.v1"));

  expect(latestOrder).toContain("Ocean Waves");
  expect(orders).toContain("pending_payment");
});

test("dashboard guard redirects unauthenticated users and login restores the intended route", async ({ page }) => {
  await page.goto("/dashboard/buyer/wishlist");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard%2Fbuyer%2Fwishlist/);

  await page.getByLabel("Email Address").fill("buyer@renewcanvas.africa");
  await page.locator("#password").fill("Password1!");
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/dashboard\/buyer\/wishlist/);
  await expect(page.getByRole("heading", { name: "My Wishlist" })).toBeVisible();
});

test("virtual room keeps controls visible and persists route-linked room state", async ({ page }) => {
  await page.goto("/virtual-room?room=right&wing=1");
  await expect(page.getByRole("heading", { name: "Infinite Museum", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Museum controls" })).toBeVisible();
  await expect(page.getByRole("button", { name: /accessible artwork list/i })).toBeVisible();
  await expect(page.getByTitle("Open map").or(page.getByTitle("Close map"))).toBeVisible();

  const progress = await page.evaluate(() => window.localStorage.getItem("renewcanvas.virtualRoom.progress.v1"));
  expect(progress).toContain('"room":"right"');
  expect(progress).toContain('"wing":1');

  await page.getByRole("button", { name: /accessible artwork list/i }).click();
  await expect(page.getByRole("heading", { name: "Artwork List", exact: true })).toBeVisible();
});

test("core public pages have no serious automated accessibility violations", async ({ page }) => {
  for (const route of ["/", "/marketplace", "/login", "/virtual-room"]) {
    await page.goto(route);
    await expect(page.locator("body")).toBeVisible();
    await expect(await seriousAxeViolations(page), route).toEqual([]);
  }
});

async function seriousAxeViolations(page: Page) {
  await page.addScriptTag({ path: axePath });
  return page.evaluate(async () => {
    const results = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
      resultTypes: ["violations"],
    });

    return results.violations
      .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
      .map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.map((node) => node.target.join(" ")).slice(0, 3),
      }));
  });
}

declare global {
  interface Window {
    axe: {
      run: (
        context: Document,
        options: {
          runOnly: { type: string; values: string[] };
          resultTypes: string[];
        }
      ) => Promise<{
        violations: Array<{
          id: string;
          impact: string | null;
          nodes: Array<{ target: string[] }>;
        }>;
      }>;
    };
  }
}
