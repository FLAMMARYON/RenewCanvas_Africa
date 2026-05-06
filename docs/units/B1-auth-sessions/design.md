# B1 Auth And Sessions Design

Date: 2026-05-06

## Scope

B1 replaces frontend-only dashboard auth with database-backed accounts and HTTP-only session cookies.

## Data Model

- `AuthSession`: stores hashed session tokens, user linkage, expiry, revocation, user agent, and IP metadata.
- `PasswordResetToken`: stores hashed, single-use reset tokens with one-hour expiry.
- `EmailVerificationToken`: stores hashed email verification tokens for follow-up email delivery work.
- Existing `User.passwordHash` is now used for real password verification.

Raw session and reset tokens are never stored in the database.

## API Surface

- `POST /api/auth/register`: creates a buyer or artist account, stores a password hash, creates a session, and sets the session cookie.
- `POST /api/auth/login`: validates credentials and creates a session cookie.
- `POST /api/auth/logout`: revokes the current session and clears the cookie.
- `GET /api/auth/session`: returns the current user from the session cookie or `401`.
- `POST /api/auth/password-reset/request`: creates a reset token when the account exists, without revealing whether the email was found.
- `POST /api/auth/password-reset/confirm`: validates the reset token, updates the password hash, marks the token used, and revokes existing sessions.

## Security Decisions

- Passwords use Node `scrypt` with per-password random salts.
- Session and reset tokens are opaque random values; only SHA-256 hashes are persisted.
- Session cookies are HTTP-only, `SameSite=Lax`, path scoped to `/`, and secure in production.
- Suspended and deleted users cannot sign in, reset passwords, or use active sessions.
- Role checks are exposed through `requireRole` for later protected API routes.

## Frontend Integration

The login, register, dashboard shell, logout, forgot-password, and reset-password screens now call backend APIs. The dashboard shell checks `/api/auth/session` instead of browser-local session state.

## Out Of Scope

- Email delivery for verification and reset messages.
- CSRF hardening.
- Rate limiting auth endpoints.
- Admin-created accounts and 2FA.
- Server component or middleware route protection for every dashboard page.
