import { Router, type IRouter } from "express";
import { eq, count, and } from "drizzle-orm";
import {
  db,
  companyProfilesTable,
  jobsTable,
  applicationsTable,
  seekerProfilesTable,
} from "@workspace/db";
import { UpdateCompanyProfileBody } from "@workspace/api-zod";
import { requireRole } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/company/profile", requireRole("company"), async (req, res): Promise<void> => {
  const [profile] = await db
    .select()
    .from(companyProfilesTable)
    .where(eq(companyProfilesTable.userId, req.session.userId!));

  if (!profile) {
    res.status(404).json({ error: "Company profile not found" });
    return;
  }

  res.json({
    user_id: profile.userId,
    company_name: profile.companyName,
    logo_url: profile.logoUrl,
    industry: profile.industry,
    company_size: profile.companySize,
    website_url: profile.websiteUrl,
    about: profile.about,
    location: profile.location,
  });
});

router.put("/company/profile", requireRole("company"), async (req, res): Promise<void> => {
  const parsed = UpdateCompanyProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const [profile] = await db
    .update(companyProfilesTable)
    .set({
      companyName: data.company_name ?? undefined,
      logoUrl: data.logo_url ?? null,
      industry: data.industry ?? undefined,
      companySize: data.company_size ?? undefined,
      websiteUrl: data.website_url ?? null,
      about: data.about ?? null,
      location: data.location ?? undefined,
    })
    .where(eq(companyProfilesTable.userId, req.session.userId!))
    .returning();

  if (!profile) {
    res.status(404).json({ error: "Company profile not found" });
    return;
  }

  res.json({
    user_id: profile.userId,
    company_name: profile.companyName,
    logo_url: profile.logoUrl,
    industry: profile.industry,
    company_size: profile.companySize,
    website_url: profile.websiteUrl,
    about: profile.about,
    location: profile.location,
  });
});

router.get("/company/dashboard", requireRole("company"), async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const companyJobs = await db
    .select({ id: jobsTable.id, status: jobsTable.status })
    .from(jobsTable)
    .where(eq(jobsTable.postedBy, userId));

  const activePostings = companyJobs.filter((j) => j.status === "open").length;
  const jobIds = companyJobs.map((j) => j.id);

  let totalApplicants = 0;
  let awaitingReview = 0;

  if (jobIds.length > 0) {
    const appCounts = await db
      .select({ status: applicationsTable.status })
      .from(applicationsTable)
      .where(
        jobIds.length === 1
          ? eq(applicationsTable.jobId, jobIds[0])
          : and(...jobIds.map((id) => eq(applicationsTable.jobId, id)))
      );

    // Actually use OR for multiple IDs - let me fix this with a simpler approach
    const allApps = await db
      .select({ status: applicationsTable.status, jobId: applicationsTable.jobId })
      .from(applicationsTable);

    const relevantApps = allApps.filter((a) => jobIds.includes(a.jobId));
    totalApplicants = relevantApps.length;
    awaitingReview = relevantApps.filter((a) => a.status === "submitted").length;
  }

  res.json({
    active_postings: activePostings,
    total_applicants: totalApplicants,
    awaiting_review: awaitingReview,
  });
});

router.get("/company/jobs", requireRole("company"), async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const jobs = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.postedBy, userId));

  const allApps = await db
    .select({ jobId: applicationsTable.jobId })
    .from(applicationsTable);

  const appCountMap = new Map<number, number>();
  for (const app of allApps) {
    appCountMap.set(app.jobId, (appCountMap.get(app.jobId) ?? 0) + 1);
  }

  const result = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    location: job.location,
    work_mode: job.workMode,
    job_type: job.jobType,
    experience_level: job.experienceLevel,
    status: job.status,
    created_at: job.createdAt.toISOString(),
    applicant_count: appCountMap.get(job.id) ?? 0,
    posted_by: job.postedBy,
  }));

  res.json(result);
});

router.get(
  "/company/jobs/:jobId/applicants",
  requireRole("company"),
  async (req, res): Promise<void> => {
    const userId = req.session.userId!;
    const raw = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
    const jobId = parseInt(raw, 10);

    if (isNaN(jobId)) {
      res.status(400).json({ error: "Invalid job ID" });
      return;
    }

    // Verify this job belongs to the company
    const [job] = await db
      .select()
      .from(jobsTable)
      .where(and(eq(jobsTable.id, jobId), eq(jobsTable.postedBy, userId)));

    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    const apps = await db
      .select({
        id: applicationsTable.id,
        jobId: applicationsTable.jobId,
        applicantId: applicationsTable.applicantId,
        coverNote: applicationsTable.coverNote,
        resumeUrl: applicationsTable.resumeUrl,
        status: applicationsTable.status,
        createdAt: applicationsTable.createdAt,
        seekerName: seekerProfilesTable.fullName,
        seekerHeadline: seekerProfilesTable.headline,
      })
      .from(applicationsTable)
      .leftJoin(
        seekerProfilesTable,
        eq(applicationsTable.applicantId, seekerProfilesTable.userId)
      )
      .where(eq(applicationsTable.jobId, jobId));

    const result = apps.map((a) => ({
      id: a.id,
      job_id: a.jobId,
      applicant_id: a.applicantId,
      cover_note: a.coverNote,
      resume_url: a.resumeUrl,
      status: a.status,
      created_at: a.createdAt.toISOString(),
      seeker_name: a.seekerName ?? "Unknown",
      seeker_headline: a.seekerHeadline,
    }));

    res.json(result);
  }
);

router.get(
  "/companies/:companyUserId/profile",
  async (req, res): Promise<void> => {
    const raw = Array.isArray(req.params.companyUserId)
      ? req.params.companyUserId[0]
      : req.params.companyUserId;
    const companyUserId = parseInt(raw, 10);

    if (isNaN(companyUserId)) {
      res.status(400).json({ error: "Invalid company user ID" });
      return;
    }

    const [profile] = await db
      .select()
      .from(companyProfilesTable)
      .where(eq(companyProfilesTable.userId, companyUserId));

    if (!profile) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    res.json({
      user_id: profile.userId,
      company_name: profile.companyName,
      logo_url: profile.logoUrl,
      industry: profile.industry,
      company_size: profile.companySize,
      website_url: profile.websiteUrl,
      about: profile.about,
      location: profile.location,
    });
  }
);

export default router;
