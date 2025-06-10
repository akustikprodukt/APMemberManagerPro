import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertMembershipTierSchema, insertMembershipBenefitSchema, updateUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize default membership tiers and benefits
  await initializeDefaultData();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = updateUserSchema.parse(req.body);
      const user = await storage.updateUser(userId, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Membership tiers routes
  app.get('/api/membership/tiers', async (req, res) => {
    try {
      const tiers = await storage.getMembershipTiers();
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching membership tiers:", error);
      res.status(500).json({ message: "Failed to fetch membership tiers" });
    }
  });

  app.put('/api/membership/tiers/:name', isAuthenticated, async (req: any, res) => {
    try {
      const { name } = req.params;
      const updates = insertMembershipTierSchema.partial().parse(req.body);
      const tier = await storage.updateMembershipTier(name, updates);
      res.json(tier);
    } catch (error) {
      console.error("Error updating membership tier:", error);
      res.status(500).json({ message: "Failed to update membership tier" });
    }
  });

  // Membership benefits routes
  app.get('/api/membership/benefits', async (req, res) => {
    try {
      const benefits = await storage.getMembershipBenefits();
      res.json(benefits);
    } catch (error) {
      console.error("Error fetching membership benefits:", error);
      res.status(500).json({ message: "Failed to fetch membership benefits" });
    }
  });

  app.put('/api/membership/benefits/:tierName', isAuthenticated, async (req: any, res) => {
    try {
      const { tierName } = req.params;
      const { benefits } = req.body;
      
      if (!Array.isArray(benefits)) {
        return res.status(400).json({ message: "Benefits must be an array" });
      }

      // Validate each benefit is max 200 characters
      for (const benefit of benefits) {
        if (typeof benefit !== 'string' || benefit.length > 200 || benefit.length === 0) {
          return res.status(400).json({ message: "Each benefit must be a non-empty string with max 200 characters" });
        }
      }

      await storage.updateBenefitsForTier(tierName, benefits);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating membership benefits:", error);
      res.status(500).json({ message: "Failed to update membership benefits" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      // TODO: Add admin role check
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/admin/users/:id/membership', isAuthenticated, async (req: any, res) => {
    try {
      // TODO: Add admin role check
      const { id } = req.params;
      const { membershipTier } = req.body;
      
      const user = await storage.updateUser(id, { membershipTier });
      res.json(user);
    } catch (error) {
      console.error("Error updating user membership:", error);
      res.status(500).json({ message: "Failed to update user membership" });
    }
  });

  // Cookie consent routes
  app.post('/api/cookie-consent', async (req, res) => {
    try {
      const { accepted, userId } = req.body;
      const consent = await storage.recordCookieConsent({
        userId: userId || null,
        accepted,
      });
      res.json(consent);
    } catch (error) {
      console.error("Error recording cookie consent:", error);
      res.status(500).json({ message: "Failed to record cookie consent" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function initializeDefaultData() {
  try {
    // Initialize default membership tiers
    const defaultTiers = [
      { name: "TAGESMITGLIED", amount: 0, currency: "CHF", interval: "Tag" },
      { name: "PASSIV", amount: 10, currency: "CHF", interval: "Jahr" },
      { name: "AKTIV", amount: 50, currency: "CHF", interval: "Jahr" },
      { name: "VIP", amount: 50, currency: "CHF", interval: "Monat" },
      { name: "SPONSOR", amount: 100, currency: "CHF", interval: "Monat" },
    ];

    for (const tier of defaultTiers) {
      const existing = await storage.getMembershipTier(tier.name);
      if (!existing) {
        await storage.createMembershipTier(tier);
      }
    }

    // Initialize default benefits
    const defaultBenefits = [
      { tierName: "TAGESMITGLIED", benefits: ["Basis Zugang", "Community Forum", "Event Infos"] },
      { tierName: "PASSIV", benefits: ["10% Rabatt auf Events"] },
      { tierName: "AKTIV", benefits: ["Exklusive Sticker"] },
      { tierName: "VIP", benefits: ["VIP-Eventzugang"] },
      { tierName: "SPONSOR", benefits: ["Werbeplatz auf Landingpage"] },
    ];

    for (const { tierName, benefits } of defaultBenefits) {
      const existing = await storage.getBenefitsForTier(tierName);
      if (existing.length === 0) {
        await storage.updateBenefitsForTier(tierName, benefits);
      }
    }
  } catch (error) {
    console.error("Error initializing default data:", error);
  }
}
