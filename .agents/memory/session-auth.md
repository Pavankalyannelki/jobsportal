---
name: CareerHub session authentication
description: How auth is implemented — session store, role enforcement, middleware pattern.
---

**Rule:** All auth is session-based (no JWT). Role is stored in the session and re-enforced server-side on every request.

**Why:** Simple cookie-based sessions with connect-pg-simple for persistence. Roles (seeker/company) are set at signup and stored in `session.userRole`. Every protected route uses `requireRole("seeker"|"company")` middleware which checks both authentication and role.

**How to apply:**
- `requireAuth` — checks `req.session.userId` exists, returns 401 otherwise
- `requireRole("seeker"|"company")` — checks both userId and userRole, returns 401 or 403
- Session secret from `SESSION_SECRET` env var (already configured in Replit secrets)
- Cookie: httpOnly, sameSite=lax in dev / none+secure in production
- connect-pg-simple creates `user_sessions` table automatically on first start
