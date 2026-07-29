import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const companyProfilesTable = pgTable("company_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  logoUrl: text("logo_url"),
  industry: text("industry").notNull().default(""),
  companySize: text("company_size", {
    enum: ["1-10", "11-50", "51-200", "201-1000", "1000+"],
  })
    .notNull()
    .default("1-10"),
  websiteUrl: text("website_url"),
  about: text("about"),
  location: text("location").notNull().default(""),
});

export type CompanyProfile = typeof companyProfilesTable.$inferSelect;
export type InsertCompanyProfile = typeof companyProfilesTable.$inferInsert;
