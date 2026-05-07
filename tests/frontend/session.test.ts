import assert from "node:assert/strict";
import test from "node:test";

import {
  createFrontendSession,
  dashboardPathForRole,
  inferRoleFromEmail,
} from "@/lib/frontend/session";

test("infers frontend roles from demo login emails", () => {
  assert.equal(inferRoleFromEmail("hello.renewcanvas.africa@gmail.com"), "admin");
  assert.equal(inferRoleFromEmail("artist@example.com"), "artist");
  assert.equal(inferRoleFromEmail("creator@example.com"), "artist");
  assert.equal(inferRoleFromEmail("buyer@example.com"), "buyer");
});

test("creates normalized frontend sessions", () => {
  const session = createFrontendSession({
    email: "  Marie.Artist@example.com ",
    role: "artist",
  });

  assert.equal(session.email, "marie.artist@example.com");
  assert.equal(session.name, "Marie Artist");
  assert.equal(session.role, "artist");
  assert.match(session.createdAt, /^\d{4}-\d{2}-\d{2}T/);
});

test("maps roles to dashboard routes", () => {
  assert.equal(dashboardPathForRole("buyer"), "/dashboard/buyer");
  assert.equal(dashboardPathForRole("artist"), "/dashboard/artist");
  assert.equal(dashboardPathForRole("admin"), "/dashboard/admin");
});
