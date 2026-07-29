import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  field: string;
  start_year: number;
  end_year: number | null;
}

export interface ExperienceEntry {
  id: string;
  company_name: string;
  title: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
}

export const seekerProfilesTable = pgTable("seeker_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull().default(""),
  headline: text("headline"),
  location: text("location"),
  phone: text("phone"),
  bio: text("bio"),
  skills: text("skills").array().notNull().default([]),
  education: jsonb("education").$type<EducationEntry[]>().notNull().default([]),
  experience: jsonb("experience").$type<ExperienceEntry[]>().notNull().default([]),
  resumeUrl: text("resume_url"),
  linkedinUrl: text("linkedin_url"),
  portfolioUrl: text("portfolio_url"),
});

export type SeekerProfile = typeof seekerProfilesTable.$inferSelect;
export type InsertSeekerProfile = typeof seekerProfilesTable.$inferInsert;
