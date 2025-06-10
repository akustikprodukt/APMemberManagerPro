import {
  users,
  membershipTiers,
  membershipBenefits,
  cookieConsents,
  type User,
  type UpsertUser,
  type MembershipTier,
  type InsertMembershipTier,
  type MembershipBenefit,
  type InsertMembershipBenefit,
  type InsertCookieConsent,
  type CookieConsent,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Membership tier operations
  getMembershipTiers(): Promise<MembershipTier[]>;
  getMembershipTier(name: string): Promise<MembershipTier | undefined>;
  createMembershipTier(tier: InsertMembershipTier): Promise<MembershipTier>;
  updateMembershipTier(name: string, updates: Partial<InsertMembershipTier>): Promise<MembershipTier>;
  
  // Membership benefits operations
  getMembershipBenefits(): Promise<MembershipBenefit[]>;
  getBenefitsForTier(tierName: string): Promise<MembershipBenefit[]>;
  createMembershipBenefit(benefit: InsertMembershipBenefit): Promise<MembershipBenefit>;
  updateBenefitsForTier(tierName: string, benefits: string[]): Promise<void>;
  
  // Cookie consent operations
  recordCookieConsent(consent: InsertCookieConsent): Promise<CookieConsent>;
  getCookieConsent(userId: string): Promise<CookieConsent | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Membership tier operations
  async getMembershipTiers(): Promise<MembershipTier[]> {
    return await db.select().from(membershipTiers).where(eq(membershipTiers.isActive, true));
  }

  async getMembershipTier(name: string): Promise<MembershipTier | undefined> {
    const [tier] = await db.select().from(membershipTiers).where(eq(membershipTiers.name, name));
    return tier;
  }

  async createMembershipTier(tier: InsertMembershipTier): Promise<MembershipTier> {
    const [newTier] = await db.insert(membershipTiers).values(tier).returning();
    return newTier;
  }

  async updateMembershipTier(name: string, updates: Partial<InsertMembershipTier>): Promise<MembershipTier> {
    const [tier] = await db
      .update(membershipTiers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(membershipTiers.name, name))
      .returning();
    return tier;
  }

  // Membership benefits operations
  async getMembershipBenefits(): Promise<MembershipBenefit[]> {
    return await db.select().from(membershipBenefits);
  }

  async getBenefitsForTier(tierName: string): Promise<MembershipBenefit[]> {
    return await db.select().from(membershipBenefits).where(eq(membershipBenefits.tierName, tierName));
  }

  async createMembershipBenefit(benefit: InsertMembershipBenefit): Promise<MembershipBenefit> {
    const [newBenefit] = await db.insert(membershipBenefits).values(benefit).returning();
    return newBenefit;
  }

  async updateBenefitsForTier(tierName: string, benefits: string[]): Promise<void> {
    // Delete existing benefits for this tier
    await db.delete(membershipBenefits).where(eq(membershipBenefits.tierName, tierName));
    
    // Insert new benefits
    if (benefits.length > 0) {
      await db.insert(membershipBenefits).values(
        benefits.map(benefit => ({ tierName, benefit }))
      );
    }
  }

  // Cookie consent operations
  async recordCookieConsent(consent: InsertCookieConsent): Promise<CookieConsent> {
    const [newConsent] = await db.insert(cookieConsents).values(consent).returning();
    return newConsent;
  }

  async getCookieConsent(userId: string): Promise<CookieConsent | undefined> {
    const [consent] = await db.select().from(cookieConsents).where(eq(cookieConsents.userId, userId));
    return consent;
  }
}

export const storage = new DatabaseStorage();
