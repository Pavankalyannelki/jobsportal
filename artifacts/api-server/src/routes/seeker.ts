import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import {
  db,
  usersTable,
  seekerProfilesTable,
  applicationsTable,
  jobsTable,
  companyProfilesTable,
} from "@workspace/db";
import { UpdateSeekerProfileBody } from "@workspace/api-zod";
import { requireRole } from "../middlewares/auth";

const router: IRouter = Router();

function calcCompleteness(profile: typeof seekerProfilesTable.$inferSelect): number {
  let score = 0;
  if (profile.fullName) score += 15;
  if (profile.headline) score += 10;
  if (profile.location) score += 10;
  if (profile.bio) score += 10;
  if (profile.skills && profile.skills.length > 0) score += 15;
  if (profile.education && profile.education.length > 0) score += 15;
  if (profile.experience && profile.experience.length > 0) score += 15;
  if (profile.resumeUrl) score += 10;
  return Math.min(score, 100);
}

router.get("/seeker/profile", requireRole("seeker"), async (req, res): Promise<void> => {
  const [profile] = await db
    .select()
    .from(seekerProfilesTable)
    .where(eq(seekerProfilesTable.userId, req.session.userId!));

  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json({
    user_id: profile.userId,
    full_name: profile.fullName,
    headline: profile.headline,
    location: profile.location,
    phone: profile.phone,
    bio: profile.bio,
    skills: profile.skills,
    education: profile.education,
    experience: profile.experience,
    resume_url: profile.resumeUrl,
    linkedin_url: profile.linkedinUrl,
    portfolio_url: profile.portfolioUrl,
    profile_completeness: calcCompleteness(profile),
  });
});

router.put("/seeker/profile", requireRole("seeker"), async (req, res): Promise<void> => {
  const parsed = UpdateSeekerProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;

  const [profile] = await db
    .update(seekerProfilesTable)
    .set({
      fullName: data.full_name ?? undefined,
      headline: data.headline ?? null,
      location: data.location ?? null,
      phone: data.phone ?? null,
      bio: data.bio ?? null,
      skills: data.skills ?? undefined,
      education: (data.education as any[]) ?? undefined,
      experience: (data.experience as any[]) ?? undefined,
      resumeUrl: data.resume_url ?? null,
      linkedinUrl: data.linkedin_url ?? null,
      portfolioUrl: data.portfolio_url ?? null,
    })
    .where(eq(seekerProfilesTable.userId, req.session.userId!))
    .returning();

  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json({
    user_id: profile.userId,
    full_name: profile.fullName,
    headline: profile.headline,
    location: profile.location,
    phone: profile.phone,
    bio: profile.bio,
    skills: profile.skills,
    education: profile.education,
    experience: profile.experience,
    resume_url: profile.resumeUrl,
    linkedin_url: profile.linkedinUrl,
    portfolio_url: profile.portfolioUrl,
    profile_completeness: calcCompleteness(profile),
  });
});

router.get("/seeker/dashboard", requireRole("seeker"), async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const apps = await db
    .select({
      id: applicationsTable.id,
      status: applicationsTable.status,
      updatedAt: applicationsTable.updatedAt,
      jobTitle: jobsTable.title,
      companyId: jobsTable.postedBy,
    })
    .from(applicationsTable)
    .innerJoin(jobsTable, eq(applicationsTable.jobId, jobsTable.id))
    .where(eq(applicationsTable.applicantId, userId))
    .orderBy(desc(applicationsTable.updatedAt));

  const submitted = apps.length;
  const under_review = apps.filter((a) => a.status === "under_review").length;
  const shortlisted = apps.filter((a) => a.status === "shortlisted").length;

  const [profile] = await db
    .select()
    .from(seekerProfilesTable)
    .where(eq(seekerProfilesTable.userId, userId));

  const profile_completeness = profile ? calcCompleteness(profile) : 0;

  // Get company names for recent activity
  const companyIds = [...new Set(apps.slice(0, 10).map((a) => a.companyId))];
  const companyProfiles =
    companyIds.length > 0
      ? await db
          .select({ userId: companyProfilesTable.userId, companyName: companyProfilesTable.companyName })
          .from(companyProfilesTable)
          .where(
            companyIds.length === 1
              ? eq(companyProfilesTable.userId, companyIds[0])
              : eq(companyProfilesTable.userId, companyIds[0])
          )
      : [];

  const companyMap = new Map(companyProfiles.map((c) => [c.userId, c.companyName]));

  const recent_activity = await Promise.all(
    apps.slice(0, 10).map(async (a) => {
      if (!companyMap.has(a.companyId)) {
        const [cp] = await db
          .select({ companyName: companyProfilesTable.companyName })
          .from(companyProfilesTable)
          .where(eq(companyProfilesTable.userId, a.companyId));
        companyMap.set(a.companyId, cp?.companyName ?? "Company");
      }
      return {
        application_id: a.id,
        job_title: a.jobTitle,
        company_name: companyMap.get(a.companyId) ?? "Company",
        status: a.status,
        updated_at: a.updatedAt.toISOString(),
      };
    })
  );

  res.json({
    applications_submitted: submitted,
    under_review,
    shortlisted,
    profile_completeness,
    recent_activity,
  });
});

router.get("/seeker/applications", requireRole("seeker"), async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const status = req.query.status as string | undefined;

  let query = db
    .select({
      id: applicationsTable.id,
      jobId: applicationsTable.jobId,
      applicantId: applicationsTable.applicantId,
      coverNote: applicationsTable.coverNote,
      resumeUrl: applicationsTable.resumeUrl,
      status: applicationsTable.status,
      createdAt: applicationsTable.createdAt,
      jobTitle: jobsTable.title,
      companyId: jobsTable.postedBy,
      jobLocation: jobsTable.location,
      jobType: jobsTable.jobType,
    })
    .from(applicationsTable)
    .innerJoin(jobsTable, eq(applicationsTable.jobId, jobsTable.id))
    .where(eq(applicationsTable.applicantId, userId))
    .orderBy(desc(applicationsTable.createdAt));

  const apps = await query;

  const filtered = status ? apps.filter((a) => a.status === status) : apps;

  const companyIds = [...new Set(filtered.map((a) => a.companyId))];
  const companyProfilesData =
    companyIds.length > 0
      ? await db
          .select({
            userId: companyProfilesTable.userId,
            companyName: companyProfilesTable.companyName,
            logoUrl: companyProfilesTable.logoUrl,
          })
          .from(companyProfilesTable)
      : [];

  const companyMap = new Map(companyProfilesData.map((c) => [c.userId, c]));

  const result = filtered.map((a) => {
    const company = companyMap.get(a.companyId);
    return {
      id: a.id,
      job_id: a.jobId,
      applicant_id: a.applicantId,
      cover_note: a.coverNote,
      resume_url: a.resumeUrl,
      status: a.status,
      created_at: a.createdAt.toISOString(),
      job_title: a.jobTitle,
      company_name: company?.companyName ?? "Company",
      company_logo_url: company?.logoUrl ?? null,
      job_location: a.jobLocation,
      job_type: a.jobType,
    };
  });

  res.json(result);
});

export default router;
