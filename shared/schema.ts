import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  address: varchar("address"),
  zip: varchar("zip"),
  city: varchar("city"),
  soundcloudUrl: varchar("soundcloud_url"),
  membershipTier: varchar("membership_tier").notNull().default("TAGESMITGLIED"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Membership tiers and pricing
export const membershipTiers = pgTable("membership_tiers", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  amount: integer("amount").notNull().default(0),
  currency: varchar("currency").notNull().default("CHF"),
  interval: varchar("interval").notNull().default("Jahr"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Membership benefits
export const membershipBenefits = pgTable("membership_benefits", {
  id: serial("id").primaryKey(),
  tierName: varchar("tier_name").notNull(),
  benefit: varchar("benefit", { length: 200 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cookie consent tracking
export const cookieConsents = pgTable("cookie_consents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  accepted: boolean("accepted").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertMembershipTier = typeof membershipTiers.$inferInsert;
export type MembershipTier = typeof membershipTiers.$inferSelect;

export type InsertMembershipBenefit = typeof membershipBenefits.$inferInsert;
export type MembershipBenefit = typeof membershipBenefits.$inferSelect;

export type InsertCookieConsent = typeof cookieConsents.$inferInsert;
export type CookieConsent = typeof cookieConsents.$inferSelect;

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertMembershipTierSchema = createInsertSchema(membershipTiers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMembershipBenefitSchema = createInsertSchema(membershipBenefits).omit({
  id: true,
  createdAt: true,
});

export const updateUserSchema = insertUserSchema.partial();
