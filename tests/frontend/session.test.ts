import assert from "node:assert/strict";
import test from "node:test";

import { dashboardPathForRole } from "@/lib/frontend/session";

// NOTE: client-side role inference (inferRoleFromEmail) and the localStorage
// session store (createFrontendSession etc.) were intentionally removed — roles
// must come from the server (`/api/auth/session`), never from the email or
// localStorage. Only the pure role→route helper remains.

test("maps roles to dashboard routes", () => {
  assert.equal(dashboardPathForRole("buyer"), "/dashboard/buyer");
  assert.equal(dashboardPathForRole("artist"), "/dashboard/artist");
  assert.equal(dashboardPathForRole("admin"), "/dashboard/admin");
});
