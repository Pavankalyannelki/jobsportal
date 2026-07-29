import { pgTable, text, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { jobsTable } from "./jobs";

export const applicationsTable = pgTable(
  "applications",
  {
    id: serial("id").primaryKey(),
    jobId: integer("job_id")
      .notNull()
      .references(() => jobsTable.id, { onDelete: "cascade" }),
    applicantId: integer("applicant_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    coverNote: text("cover_note"),
    resumeUrl: text("resume_url"),
    status: text("status", {
      enum: ["submitted", "under_review", "shortlisted", "rejected", "hired"],
    })
      .notNull()
      .default("submitted"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [unique("unique_application").on(table.jobId, table.applicantId)],
);

export type Application = typeof applicationsTable.$inferSelect;
export type InsertApplication = typeof applicationsTable.$inferInsert;
