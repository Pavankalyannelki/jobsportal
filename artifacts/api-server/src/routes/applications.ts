import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import {
  db,
  applicationsTable,
  jobsTable,
  seekerProfilesTable,
} from "@workspace/db";
import {
  ApplyToJobBody,
  ApplyToJobParams,
  UpdateApplicationStatusBody,
  UpdateApplicationStatusParams,
} from "@workspace/api-zod";
import { requireRole } from "../middlewares/auth";

const router: IRouter = Router();

router.post(
  "/jobs/:jobId/apply",
  requireRole("seeker"),
  async (req, res): Promise<void> => {
    const rawId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
    const jobId = parseInt(rawId, 10);

    if (isNaN(jobId)) {
      res.status(400).json({ error: "Invalid job ID" });
      return;
    }

    // Check job exists and is open
    const [job] = await db
      .select()
      .from(jobsTable)
      .where(and(eq(jobsTable.id, jobId), eq(jobsTable.status, "open")));

    if (!job) {
      res.status(404).json({ error: "Job not found or no longer accepting applications" });
      return;
    }

    // Check not applying to own company's job (company can't apply)
    // Already enforced by requireRole("seeker")

    // Check duplicate application
    const [existing] = await db
      .select()
      .from(applicationsTable)
      .where(
        and(
          eq(applicationsTable.jobId, jobId),
          eq(applicationsTable.applicantId, req.session.userId!)
        )
      );

    if (existing) {
      res.status(400).json({ error: "You have already applied to this job" });
      return;
    }

    const parsed = ApplyToJobBody.safeParse(req.body);
    const body = parsed.success ? parsed.data : {};

    // Use profile resume as fallback
    let resumeUrl = body.resume_url ?? null;
    if (!resumeUrl) {
      const [profile] = await db
        .select({ resumeUrl: seekerProfilesTable.resumeUrl })
        .from(seekerProfilesTable)
        .where(eq(seekerProfilesTable.userId, req.session.userId!));
      resumeUrl = profile?.resumeUrl ?? null;
    }

    const [application] = await db
      .insert(applicationsTable)
      .values({
        jobId,
        applicantId: req.session.userId!,
        coverNote: body.cover_note ?? null,
        resumeUrl,
      })
      .returning();

    res.status(201).json({
      id: application.id,
      job_id: application.jobId,
      applicant_id: application.applicantId,
      cover_note: application.coverNote,
      resume_url: application.resumeUrl,
      status: application.status,
      created_at: application.createdAt.toISOString(),
    });
  }
);

router.patch(
  "/applications/:applicationId/status",
  requireRole("company"),
  async (req, res): Promise<void> => {
    const rawId = Array.isArray(req.params.applicationId)
      ? req.params.applicationId[0]
      : req.params.applicationId;
    const applicationId = parseInt(rawId, 10);

    if (isNaN(applicationId)) {
      res.status(400).json({ error: "Invalid application ID" });
      return;
    }

    const parsed = UpdateApplicationStatusBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    // Verify the application belongs to one of this company's jobs
    const [app] = await db
      .select({
        id: applicationsTable.id,
        jobId: applicationsTable.jobId,
        applicantId: applicationsTable.applicantId,
        coverNote: applicationsTable.coverNote,
        resumeUrl: applicationsTable.resumeUrl,
        status: applicationsTable.status,
        createdAt: applicationsTable.createdAt,
        postedBy: jobsTable.postedBy,
      })
      .from(applicationsTable)
      .innerJoin(jobsTable, eq(applicationsTable.jobId, jobsTable.id))
      .where(eq(applicationsTable.id, applicationId));

    if (!app) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    if (app.postedBy !== req.session.userId) {
      res.status(403).json({ error: "You can only update applications for your own job postings" });
      return;
    }

    const [updated] = await db
      .update(applicationsTable)
      .set({ status: parsed.data.status })
      .where(eq(applicationsTable.id, applicationId))
      .returning();

    res.json({
      id: updated.id,
      job_id: updated.jobId,
      applicant_id: updated.applicantId,
      cover_note: updated.coverNote,
      resume_url: updated.resumeUrl,
      status: updated.status,
      created_at: updated.createdAt.toISOString(),
    });
  }
);

export default router;
