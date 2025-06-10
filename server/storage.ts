import {
  users,
  membershipTiers,
  membershipBenefits,
  cookieConsents,
  webRadioSettings,
  galleryImages,
  newsPosts,
  newsComments,
  type User,
  type UpsertUser,
  type MembershipTier,
  type InsertMembershipTier,
  type MembershipBenefit,
  type InsertMembershipBenefit,
  type InsertCookieConsent,
  type CookieConsent,
  type WebRadioSettings,
  type InsertWebRadioSettings,
  type GalleryImage,
  type InsertGalleryImage,
  type NewsPost,
  type InsertNewsPost,
  type NewsComment,
  type InsertNewsComment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUsersBySoundcloud(): Promise<User[]>;
  
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
  
  // Web radio operations
  getWebRadioSettings(): Promise<WebRadioSettings | undefined>;
  updateWebRadioSettings(settings: Partial<InsertWebRadioSettings>): Promise<WebRadioSettings>;
  
  // Gallery operations
  getGalleryImages(): Promise<GalleryImage[]>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  updateGalleryImage(id: number, updates: Partial<InsertGalleryImage>): Promise<GalleryImage>;
  deleteGalleryImage(id: number): Promise<void>;
  
  // News operations
  getNewsPosts(): Promise<NewsPost[]>;
  getNewsPost(id: number): Promise<NewsPost | undefined>;
  createNewsPost(post: InsertNewsPost): Promise<NewsPost>;
  updateNewsPost(id: number, updates: Partial<InsertNewsPost>): Promise<NewsPost>;
  deleteNewsPost(id: number): Promise<void>;
  
  // News comments operations
  getNewsComments(postId: number): Promise<NewsComment[]>;
  createNewsComment(comment: InsertNewsComment): Promise<NewsComment>;
  deleteNewsComment(id: number): Promise<void>;
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

  async getUsersBySoundcloud(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isDjActive, true));
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

  // Web radio operations
  async getWebRadioSettings(): Promise<WebRadioSettings | undefined> {
    const [settings] = await db.select().from(webRadioSettings).limit(1);
    return settings;
  }

  async updateWebRadioSettings(settings: Partial<InsertWebRadioSettings>): Promise<WebRadioSettings> {
    const existing = await this.getWebRadioSettings();
    if (existing) {
      const [updated] = await db
        .update(webRadioSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(webRadioSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(webRadioSettings).values(settings).returning();
      return created;
    }
  }

  // Gallery operations
  async getGalleryImages(): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages).where(eq(galleryImages.isActive, true));
  }

  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const [newImage] = await db.insert(galleryImages).values(image).returning();
    return newImage;
  }

  async updateGalleryImage(id: number, updates: Partial<InsertGalleryImage>): Promise<GalleryImage> {
    const [updated] = await db
      .update(galleryImages)
      .set(updates)
      .where(eq(galleryImages.id, id))
      .returning();
    return updated;
  }

  async deleteGalleryImage(id: number): Promise<void> {
    await db.update(galleryImages).set({ isActive: false }).where(eq(galleryImages.id, id));
  }

  // News operations
  async getNewsPosts(): Promise<NewsPost[]> {
    return await db.select().from(newsPosts).where(eq(newsPosts.isActive, true));
  }

  async getNewsPost(id: number): Promise<NewsPost | undefined> {
    const [post] = await db.select().from(newsPosts).where(eq(newsPosts.id, id));
    return post;
  }

  async createNewsPost(post: InsertNewsPost): Promise<NewsPost> {
    const [newPost] = await db.insert(newsPosts).values(post).returning();
    return newPost;
  }

  async updateNewsPost(id: number, updates: Partial<InsertNewsPost>): Promise<NewsPost> {
    const [updated] = await db
      .update(newsPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(newsPosts.id, id))
      .returning();
    return updated;
  }

  async deleteNewsPost(id: number): Promise<void> {
    await db.update(newsPosts).set({ isActive: false }).where(eq(newsPosts.id, id));
  }

  // News comments operations
  async getNewsComments(postId: number): Promise<NewsComment[]> {
    return await db.select().from(newsComments).where(eq(newsComments.postId, postId));
  }

  async createNewsComment(comment: InsertNewsComment): Promise<NewsComment> {
    const [newComment] = await db.insert(newsComments).values(comment).returning();
    return newComment;
  }

  async deleteNewsComment(id: number): Promise<void> {
    await db.update(newsComments).set({ isActive: false }).where(eq(newsComments.id, id));
  }
}

export const storage = new DatabaseStorage();
