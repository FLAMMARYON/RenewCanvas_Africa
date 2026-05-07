import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const repoRoot = process.cwd();

test("frontend app code has no console-only user actions", () => {
  const files = listFiles(join(repoRoot, "src", "app"), [".tsx", ".ts"]).concat(
    listFiles(join(repoRoot, "src", "components"), [".tsx", ".ts"])
  );

  const offenders = files.filter((file) => readFileSync(file, "utf8").includes("console.log"));

  assert.deepEqual(offenders, []);
});

test("dashboard shell enforces a server session before rendering protected content", () => {
  const source = readFileSync(join(repoRoot, "src", "components", "DashboardLayout.tsx"), "utf8");

  assert.match(source, /readServerSession/);
  assert.match(source, /router\.replace\(`\/login\?next=/);
  assert.match(source, /activeSession\.role !== role/);
  assert.match(source, /logoutServerSession/);
});

test("auth pages use backend auth APIs and route users to role dashboards", () => {
  const login = readFileSync(join(repoRoot, "src", "app", "login", "page.tsx"), "utf8");
  const register = readFileSync(join(repoRoot, "src", "app", "register", "page.tsx"), "utf8");

  assert.match(login, /loginWithPassword/);
  assert.match(login, /dashboardPathForRole/);
  assert.match(register, /registerAccount/);
  assert.match(register, /dashboardPathForRole/);
});

test("dashboard profile pages use the backend profile API", () => {
  const buyerProfile = readFileSync(
    join(repoRoot, "src", "app", "dashboard", "buyer", "profile", "page.tsx"),
    "utf8"
  );
  const artistProfile = readFileSync(
    join(repoRoot, "src", "app", "dashboard", "artist", "profile", "page.tsx"),
    "utf8"
  );
  const adminProfile = readFileSync(
    join(repoRoot, "src", "app", "dashboard", "admin", "profile", "page.tsx"),
    "utf8"
  );

  for (const source of [buyerProfile, artistProfile, adminProfile]) {
    assert.match(source, /readProfile/);
    assert.match(source, /saveProfile/);
  }

  assert.doesNotMatch(artistProfile, /saveArtistProfileDraft/);
});

test("artist artwork creation uses the pricing API instead of local pricing math", () => {
  const source = readFileSync(
    join(repoRoot, "src", "app", "dashboard", "artist", "artworks", "create", "page.tsx"),
    "utf8"
  );

  assert.match(source, /fetch\("\/api\/pricing"/);
  assert.doesNotMatch(source, /Mock AI pricing logic/);
});

test("artwork pages use backend artwork APIs instead of local artwork drafts", () => {
  const marketplace = readFileSync(join(repoRoot, "src", "app", "marketplace", "page.tsx"), "utf8");
  const artistList = readFileSync(
    join(repoRoot, "src", "app", "dashboard", "artist", "artworks", "page.tsx"),
    "utf8"
  );
  const artistCreate = readFileSync(
    join(repoRoot, "src", "app", "dashboard", "artist", "artworks", "create", "page.tsx"),
    "utf8"
  );
  const adminArtworks = readFileSync(
    join(repoRoot, "src", "app", "dashboard", "admin", "artworks", "page.tsx"),
    "utf8"
  );

  assert.match(marketplace, /listArtworks/);
  assert.match(artistList, /listArtworks\("artist"\)/);
  assert.match(artistCreate, /createArtwork/);
  assert.match(adminArtworks, /reviewArtwork/);
  assert.doesNotMatch(artistCreate, /saveArtworkDraft/);
});

test("marketplace and wishlist use backend filtering and persistence APIs", () => {
  const marketplace = readFileSync(join(repoRoot, "src", "app", "marketplace", "page.tsx"), "utf8");
  const wishlist = readFileSync(
    join(repoRoot, "src", "app", "dashboard", "buyer", "wishlist", "page.tsx"),
    "utf8"
  );
  const artworkDetail = readFileSync(join(repoRoot, "src", "app", "artwork", "[id]", "page.tsx"), "utf8");

  assert.match(marketplace, /sort/);
  assert.match(marketplace, /pagination/);
  assert.match(wishlist, /readWishlist/);
  assert.match(wishlist, /removeFromWishlist/);
  assert.doesNotMatch(wishlist, /markWishlistItemRemoved/);
  assert.match(artworkDetail, /recordArtworkView/);
});

test("artist and admin artwork views show persisted recommendation snapshots", () => {
  const artistEdit = readFileSync(
    join(repoRoot, "src", "app", "dashboard", "artist", "artworks", "[id]", "page.tsx"),
    "utf8"
  );
  const adminArtworks = readFileSync(
    join(repoRoot, "src", "app", "dashboard", "admin", "artworks", "page.tsx"),
    "utf8"
  );
  const backend = readFileSync(join(repoRoot, "src", "lib", "backend", "artworks.ts"), "utf8");

  assert.match(backend, /pricingRecommendation\.create/);
  assert.match(backend, /impactEstimate\.create/);
  assert.match(backend, /views: 0/);
  assert.match(backend, /wishlistCount: 0/);
  assert.match(artistEdit, /latestPricingRecommendation/);
  assert.match(artistEdit, /latestImpactEstimate/);
  assert.match(adminArtworks, /latestPricingRecommendation/);
  assert.match(adminArtworks, /latestImpactEstimate/);
});

test("admin verification uses backend workflow APIs instead of static prototype data", () => {
  const adminVerification = readFileSync(
    join(repoRoot, "src", "app", "dashboard", "admin", "verification", "page.tsx"),
    "utf8"
  );
  const artistEdit = readFileSync(
    join(repoRoot, "src", "app", "dashboard", "artist", "artworks", "[id]", "page.tsx"),
    "utf8"
  );

  assert.match(adminVerification, /listVerificationItems/);
  assert.match(adminVerification, /decideVerification/);
  assert.match(artistEdit, /submitVerificationEvidence/);
  assert.doesNotMatch(adminVerification, /prototypeArtworks/);
});

test("checkout and order dashboards use backend order APIs", () => {
  const checkout = readFileSync(join(repoRoot, "src", "app", "checkout", "page.tsx"), "utf8");
  const confirmation = readFileSync(join(repoRoot, "src", "app", "order-confirmation", "page.tsx"), "utf8");
  const buyerOrders = readFileSync(join(repoRoot, "src", "app", "dashboard", "buyer", "orders", "page.tsx"), "utf8");
  const artistOrders = readFileSync(join(repoRoot, "src", "app", "dashboard", "artist", "orders", "page.tsx"), "utf8");
  const adminOrders = readFileSync(join(repoRoot, "src", "app", "dashboard", "admin", "orders", "page.tsx"), "utf8");
  const backend = readFileSync(join(repoRoot, "src", "lib", "backend", "orders.ts"), "utf8");

  assert.match(checkout, /createOrder/);
  assert.match(confirmation, /readOrder/);
  for (const source of [buyerOrders, artistOrders, adminOrders]) {
    assert.match(source, /listOrders/);
    assert.doesNotMatch(source, /Mock orders data/);
  }
  assert.doesNotMatch(checkout, /saveOrder/);
  assert.match(backend, /order\.create/);
  assert.match(backend, /status: "reserved"/);
});

test("virtual room exposes realistic controls and non-canvas review mode", () => {
  const source = readFileSync(join(repoRoot, "src", "app", "virtual-room", "page.tsx"), "utf8");
  const dataSource = readFileSync(join(repoRoot, "src", "lib", "frontend", "virtual-room-data.ts"), "utf8");

  assert.match(source, /ACESFilmicToneMapping/);
  assert.match(source, /createEnvironmentTexture/);
  assert.match(source, /createArtworkCanvas/);
  assert.match(source, /fixed bottom-5 right-5/);
  assert.match(source, /fixed bottom-20 left-5/);
  assert.match(source, /Show accessible artwork list/);
  assert.ok(source.includes("accessible artwork list"));
  assert.match(source, /RenewCanvas Africa/);
  assert.match(dataSource, /fallbackColor/);
});

function listFiles(root: string, extensions: string[]): string[] {
  return readdirSync(root).flatMap((entry) => {
    const fullPath = join(root, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return listFiles(fullPath, extensions);
    }

    return extensions.some((extension) => fullPath.endsWith(extension)) ? [fullPath] : [];
  });
}
