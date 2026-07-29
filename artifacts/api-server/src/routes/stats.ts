import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, jobsTable, companyProfilesTable, applicationsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const [jobCount] = await db
    .select({ count: count() })
    .from(jobsTable)
    .where(eq(jobsTable.status, "open"));

  const [companyCount] = await db
    .select({ count: count() })
    .from(companyProfilesTable);

  const [hireCount] = await db
    .select({ count: count() })
    .from(applicationsTable)
    .where(eq(applicationsTable.status, "hired"));

  res.json({
    total_jobs: jobCount?.count ?? 0,
    total_companies: companyCount?.count ?? 0,
    total_hires: hireCount?.count ?? 0,
  });
});

export default router;
