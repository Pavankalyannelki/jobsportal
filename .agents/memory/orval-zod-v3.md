---
name: Orval + Zod v3 compatibility
description: Orval v8.23 generates Zod v4-style methods that break with Zod v3; workaround is to avoid certain OpenAPI formats.
---

**Rule:** Do not use `format: email` or `type: integer` in the OpenAPI spec when the workspace uses Zod v3 (catalog: `^3.25.76`).

**Why:** Orval v8.23 generates `zod.email()` for `format: email` and `zod.int()` for `type: integer`. These are Zod v4 standalone validators that don't exist in v3, causing `tsc --build` to fail with TS2339 errors after codegen.

**How to apply:** Use `type: string` (no format) for email fields; use `type: number` instead of `type: integer` for numeric IDs and counts. Validation of email format and integer constraints can be done manually in route handlers if needed.
