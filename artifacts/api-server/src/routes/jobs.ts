import { Router, type IRouter } from "express";
import { eq, and, ilike, or, sql } from "drizzle-orm";
import {
  db,
  jobsTable,
  companyProfilesTable,
  applicationsTable,
} from "@workspace/db";
import { CreateJobBody, UpdateJobBody, ListJobsQueryParams, GetJobParams, UpdateJobParams } from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/jobs", async (req, res): Promise<void> => {
  const params = ListJobsQueryParams.safeParse(req.query);
  const filters = params.success ? params.data : {};

  let jobs = await db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      location: jobsTable.location,
      workMode: jobsTable.workMode,
      jobType: jobsTable.jobType,
      experienceLevel: jobsTable.experienceLevel,
      salaryMin: jobsTable.salaryMin,
      salaryMax: jobsTable.salaryMax,
      status: jobsTable.status,
      createdAt: jobsTable.createdAt,
      postedBy: jobsTable.postedBy,
      companyName: companyProfilesTable.companyName,
      companyLogoUrl: companyProfilesTable.logoUrl,
    })
    .from(jobsTable)
    .leftJoin(companyProfilesTable, eq(jobsTable.postedBy, companyProfilesTable.userId))
    .where(eq(jobsTable.status, "open"))
    .orderBy(sql`${jobsTable.createdAt} DESC`);

  // Apply filters
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase();
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(kw) ||
        (j.companyName?.toLowerCase().includes(kw) ?? false) ||
        j.location.toLowerCase().includes(kw)
    );
  }
  if (filters.location) {
    const loc = filters.location.toLowerCase();
    jobs = jobs.filter((j) => j.location.toLowerCase().includes(loc));
  }
  if (filters.job_type) {
    jobs = jobs.filter((j) => j.jobType === filters.job_type);
  }
  if (filters.work_mode) {
    jobs = jobs.filter((j) => j.workMode === filters.work_mode);
  }
  if (filters.experience_level) {
    jobs = jobs.filter((j) => j.experienceLevel === filters.experience_level);
  }

  // Check has_applied for authenticated seekers
  let appliedJobIds = new Set<number>();
  if (req.session?.userId && req.session.userRole === "seeker") {
    const applied = await db
      .select({ jobId: applicationsTable.jobId })
      .from(applicationsTable)
      .where(eq(applicationsTable.applicantId, req.session.userId));
    appliedJobIds = new Set(applied.map((a) => a.jobId));
  }

  const result = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    company_name: job.companyName ?? "Company",
    company_logo_url: job.companyLogoUrl ?? null,
    location: job.location,
    work_mode: job.workMode,
    job_type: job.jobType,
    experience_level: job.experienceLevel,
    salary_min: job.salaryMin ?? null,
    salary_max: job.salaryMax ?? null,
    status: job.status,
    created_at: job.createdAt.toISOString(),
    posted_by: job.postedBy,
    has_applied: req.session?.userId ? appliedJobIds.has(job.id) : null,
  }));

  res.json(result);
});

router.post("/jobs", requireRole("company"), async (req, res): Promise<void> => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const [job] = await db
    .insert(jobsTable)
    .values({
      postedBy: req.session.userId!,
      title: data.title,
      description: data.description,
      responsibilities: data.responsibilities ?? null,
      requirements: data.requirements ?? null,
      location: data.location,
      workMode: data.work_mode,
      jobType: data.job_type,
      salaryMin: data.salary_min ?? null,
      salaryMax: data.salary_max ?? null,
      experienceLevel: data.experience_level,
    })
    .returning();

  res.status(201).json({
    id: job.id,
    posted_by: job.postedBy,
    title: job.title,
    description: job.description,
    responsibilities: job.responsibilities,
    requirements: job.requirements,
    location: job.location,
    work_mode: job.workMode,
    job_type: job.jobType,
    salary_min: job.salaryMin,
    salary_max: job.salaryMax,
    experience_level: job.experienceLevel,
    status: job.status,
    created_at: job.createdAt.toISOString(),
  });
});

router.get("/jobs/:jobId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
  const jobId = parseInt(rawId, 10);

  if (isNaN(jobId)) {
    res.status(400).json({ error: "Invalid job ID" });
    return;
  }

  const [row] = await db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      description: jobsTable.description,
      responsibilities: jobsTable.responsibilities,
      requirements: jobsTable.requirements,
      location: jobsTable.location,
      workMode: jobsTable.workMode,
      jobType: jobsTable.jobType,
      salaryMin: jobsTable.salaryMin,
      salaryMax: jobsTable.salaryMax,
      experienceLevel: jobsTable.experienceLevel,
      status: jobsTable.status,
      createdAt: jobsTable.createdAt,
      postedBy: jobsTable.postedBy,
      companyUserId: companyProfilesTable.userId,
      companyName: companyProfilesTable.companyName,
      companyLogoUrl: companyProfilesTable.logoUrl,
      companyIndustry: companyProfilesTable.industry,
      companySize: companyProfilesTable.companySize,
      companyWebsite: companyProfilesTable.websiteUrl,
      companyAbout: companyProfilesTable.about,
      companyLocation: companyProfilesTable.location,
    })
    .from(jobsTable)
    .leftJoin(companyProfilesTable, eq(jobsTable.postedBy, companyProfilesTable.userId))
    .where(eq(jobsTable.id, jobId));

  if (!row) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  let has_applied: boolean | null = null;
  if (req.session?.userId && req.session.userRole === "seeker") {
    const [app] = await db
      .select({ id: applicationsTable.id })
      .from(applicationsTable)
      .where(
        and(
          eq(applicationsTable.jobId, jobId),
          eq(applicationsTable.applicantId, req.session.userId)
        )
      );
    has_applied = !!app;
  }

  res.json({
    id: row.id,
    title: row.title,
    description: row.description,
    responsibilities: row.responsibilities,
    requirements: row.requirements,
    location: row.location,
    work_mode: row.workMode,
    job_type: row.jobType,
    salary_min: row.salaryMin,
    salary_max: row.salaryMax,
    experience_level: row.experienceLevel,
    status: row.status,
    created_at: row.createdAt.toISOString(),
    posted_by: row.postedBy,
    has_applied,
    company: {
      user_id: row.companyUserId ?? row.postedBy,
      company_name: row.companyName ?? "Company",
      logo_url: row.companyLogoUrl ?? null,
      industry: row.companyIndustry ?? "",
      company_size: row.companySize ?? "1-10",
      website_url: row.companyWebsite ?? null,
      about: row.companyAbout ?? null,
      location: row.companyLocation ?? "",
    },
  });
});

router.patch("/jobs/:jobId", requireRole("company"), async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
  const jobId = parseInt(rawId, 10);

  if (isNaN(jobId)) {
    res.status(400).json({ error: "Invalid job ID" });
    return;
  }

  const parsed = UpdateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Verify ownership
  const [existing] = await db
    .select()
    .from(jobsTable)
    .where(and(eq(jobsTable.id, jobId), eq(jobsTable.postedBy, req.session.userId!)));

  if (!existing) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const data = parsed.data;
  const [job] = await db
    .update(jobsTable)
    .set({
      title: data.title ?? undefined,
      description: data.description ?? undefined,
      responsibilities: data.responsibilities ?? null,
      requirements: data.requirements ?? null,
      location: data.location ?? undefined,
      workMode: data.work_mode ?? undefined,
      jobType: data.job_type ?? undefined,
      salaryMin: data.salary_min ?? null,
      salaryMax: data.salary_max ?? null,
      experienceLevel: data.experience_level ?? undefined,
      status: data.status ?? undefined,
    })
    .where(eq(jobsTable.id, jobId))
    .returning();

  res.json({
    id: job.id,
    posted_by: job.postedBy,
    title: job.title,
    description: job.description,
    responsibilities: job.responsibilities,
    requirements: job.requirements,
    location: job.location,
    work_mode: job.workMode,
    job_type: job.jobType,
    salary_min: job.salaryMin,
    salary_max: job.salaryMax,
    experience_level: job.experienceLevel,
    status: job.status,
    created_at: job.createdAt.toISOString(),
  });
});

export default router;
