import { Router, type IRouter } from "express";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db, usersTable, seekerProfilesTable, companyProfilesTable } from "@workspace/db";
import { SignupBody, LoginBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/auth/signup", async (req, res): Promise<void> => {
  const parsed = SignupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password, role, full_name, headline, company_name, industry } = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(usersTable)
    .values({ email, passwordHash, role })
    .returning();

  if (role === "seeker") {
    await db.insert(seekerProfilesTable).values({
      userId: user.id,
      fullName: full_name ?? "",
      headline: headline ?? null,
    });
  } else {
    await db.insert(companyProfilesTable).values({
      userId: user.id,
      companyName: company_name ?? email.split("@")[0],
      industry: industry ?? "",
    });
  }

  req.session.userId = user.id;
  req.session.userRole = user.role;

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.createdAt.toISOString(),
    },
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  req.session.userId = user.id;
  req.session.userRole = user.role;

  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.createdAt.toISOString(),
    },
  });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {});
  res.sendStatus(204);
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId!));

  if (!user) {
    req.session.destroy(() => {});
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    created_at: user.createdAt.toISOString(),
  });
});

export default router;
