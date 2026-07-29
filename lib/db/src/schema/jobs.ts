import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  postedBy: integer("posted_by")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  responsibilities: text("responsibilities"),
  requirements: text("requirements"),
  location: text("location").notNull(),
  workMode: text("work_mode", { enum: ["On-site", "Remote", "Hybrid"] }).notNull(),
  jobType: text("job_type", {
    enum: ["Full-time", "Part-time", "Contract", "Internship"],
  }).notNull(),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  experienceLevel: text("experience_level", {
    enum: ["Entry / Student", "Mid", "Senior"],
  }).notNull(),
  status: text("status", { enum: ["open", "closed"] }).notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Job = typeof jobsTable.$inferSelect;
export type InsertJob = typeof jobsTable.$inferInsert;
