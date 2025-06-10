import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertMembershipTierSchema, 
  insertMembershipBenefitSchema, 
  updateUserSchema,
  insertWebRadioSettingsSchema,
  insertGalleryImageSchema,
  insertNewsPostSchema,
  insertNewsCommentSchema
} from "@shared/schema";
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

  // Web radio routes
  app.get('/api/radio/settings', async (req, res) => {
    try {
      const settings = await storage.getWebRadioSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching radio settings:", error);
      res.status(500).json({ message: "Failed to fetch radio settings" });
    }
  });

  app.put('/api/radio/settings', isAuthenticated, async (req: any, res) => {
    try {
      const updates = insertWebRadioSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateWebRadioSettings(updates);
      res.json(settings);
    } catch (error) {
      console.error("Error updating radio settings:", error);
      res.status(500).json({ message: "Failed to update radio settings" });
    }
  });

  app.get('/api/radio/dj-users', async (req, res) => {
    try {
      const djUsers = await storage.getUsersBySoundcloud();
      res.json(djUsers);
    } catch (error) {
      console.error("Error fetching DJ users:", error);
      res.status(500).json({ message: "Failed to fetch DJ users" });
    }
  });

  // Gallery routes
  app.get('/api/gallery', async (req, res) => {
    try {
      const images = await storage.getGalleryImages();
      res.json(images);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  app.post('/api/gallery', isAuthenticated, async (req: any, res) => {
    try {
      const imageData = insertGalleryImageSchema.parse(req.body);
      const image = await storage.createGalleryImage(imageData);
      res.json(image);
    } catch (error) {
      console.error("Error creating gallery image:", error);
      res.status(500).json({ message: "Failed to create gallery image" });
    }
  });

  app.put('/api/gallery/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = insertGalleryImageSchema.partial().parse(req.body);
      const image = await storage.updateGalleryImage(parseInt(id), updates);
      res.json(image);
    } catch (error) {
      console.error("Error updating gallery image:", error);
      res.status(500).json({ message: "Failed to update gallery image" });
    }
  });

  app.delete('/api/gallery/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteGalleryImage(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      res.status(500).json({ message: "Failed to delete gallery image" });
    }
  });

  // News routes
  app.get('/api/news', async (req, res) => {
    try {
      const posts = await storage.getNewsPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching news posts:", error);
      res.status(500).json({ message: "Failed to fetch news posts" });
    }
  });

  app.post('/api/news', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = insertNewsPostSchema.parse({ ...req.body, authorId: userId });
      const post = await storage.createNewsPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating news post:", error);
      res.status(500).json({ message: "Failed to create news post" });
    }
  });

  app.put('/api/news/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = insertNewsPostSchema.partial().parse(req.body);
      const post = await storage.updateNewsPost(parseInt(id), updates);
      res.json(post);
    } catch (error) {
      console.error("Error updating news post:", error);
      res.status(500).json({ message: "Failed to update news post" });
    }
  });

  app.delete('/api/news/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNewsPost(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting news post:", error);
      res.status(500).json({ message: "Failed to delete news post" });
    }
  });

  // News comments routes
  app.get('/api/news/:id/comments', async (req, res) => {
    try {
      const { id } = req.params;
      const comments = await storage.getNewsComments(parseInt(id));
      res.json(comments);
    } catch (error) {
      console.error("Error fetching news comments:", error);
      res.status(500).json({ message: "Failed to fetch news comments" });
    }
  });

  app.post('/api/news/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const commentData = insertNewsCommentSchema.parse({
        ...req.body,
        postId: parseInt(id),
        userId,
      });
      const comment = await storage.createNewsComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error creating news comment:", error);
      res.status(500).json({ message: "Failed to create news comment" });
    }
  });

  app.delete('/api/news/comments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNewsComment(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting news comment:", error);
      res.status(500).json({ message: "Failed to delete news comment" });
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

    // Initialize test users for each membership tier
    const testUsers = [
      {
        id: "test-tagesmitglied",
        email: "tages@akustik-produkt.ch",
        firstName: "Tages",
        lastName: "Mitglied",
        membershipTier: "TAGESMITGLIED",
        isAdmin: false,
        isDjActive: false,
        soundcloudUrl: "https://soundcloud.com/tagesuser"
      },
      {
        id: "test-passiv",
        email: "passiv@akustik-produkt.ch",
        firstName: "Passiv",
        lastName: "User",
        membershipTier: "PASSIV",
        isAdmin: false,
        isDjActive: true,
        soundcloudUrl: "https://soundcloud.com/passivuser"
      },
      {
        id: "test-aktiv",
        email: "aktiv@akustik-produkt.ch",
        firstName: "Aktiv",
        lastName: "Member",
        membershipTier: "AKTIV",
        isAdmin: false,
        isDjActive: true,
        soundcloudUrl: "https://soundcloud.com/aktivmember"
      },
      {
        id: "test-vip",
        email: "vip@akustik-produkt.ch",
        firstName: "VIP",
        lastName: "Elite",
        membershipTier: "VIP",
        isAdmin: false,
        isDjActive: true,
        soundcloudUrl: "https://soundcloud.com/vipelite"
      },
      {
        id: "test-sponsor",
        email: "sponsor@akustik-produkt.ch",
        firstName: "Sponsor",
        lastName: "Premium",
        membershipTier: "SPONSOR",
        isAdmin: true,
        isDjActive: true,
        soundcloudUrl: "https://soundcloud.com/sponsorpremium"
      }
    ];

    for (const user of testUsers) {
      const existing = await storage.getUser(user.id);
      if (!existing) {
        await storage.upsertUser(user);
      }
    }

    // Initialize default web radio settings
    const radioSettings = await storage.getWebRadioSettings();
    if (!radioSettings) {
      await storage.updateWebRadioSettings({
        radioUrl: "https://stream.akustik-produkt.ch/live",
        isActive: true,
        djMode: false
      });
    }

    // Initialize default gallery images
    const galleryImages = await storage.getGalleryImages();
    if (galleryImages.length === 0) {
      const defaultImages = [
        {
          imageUrl: "https://picsum.photos/800/600?random=1",
          title: "Cyberpunk Event 2024",
          description: "Unser erstes großes Cyberpunk-Event mit neon Lights und elektronischer Musik."
        },
        {
          imageUrl: "https://picsum.photos/800/600?random=2",
          title: "DJ Night Special",
          description: "Eine unvergessliche Nacht mit den besten DJs der elektronischen Szene."
        },
        {
          imageUrl: "https://picsum.photos/800/600?random=3",
          title: "Studio Sessions",
          description: "Behind the scenes Aufnahmen aus unserem hochmodernen Studio."
        }
      ];

      for (const image of defaultImages) {
        await storage.createGalleryImage(image);
      }
    }

    // Initialize default news posts
    const newsPosts = await storage.getNewsPosts();
    if (newsPosts.length === 0) {
      const defaultPosts = [
        {
          title: "Willkommen im Cyberpunk Universum",
          content: "Heute starten wir offiziell unsere neue Mitgliederverwaltung im futuristischen Cyberpunk-Design. Erlebe die Zukunft der elektronischen Musik mit uns!",
          authorId: "test-sponsor"
        },
        {
          title: "Neue DJ Features verfügbar",
          content: "Ab sofort können alle Mitglieder ihre SoundCloud-Links hinterlegen und als DJ aktiv werden. Aktiviere den DJ-Modus in deinem Profil!",
          authorId: "test-sponsor"
        },
        {
          title: "Galerie ist online",
          content: "Schaut euch unsere neue Bildergalerie an! Hier findet ihr Impressionen von unseren Events und Studio-Sessions.",
          authorId: "test-sponsor"
        }
      ];

      for (const post of defaultPosts) {
        await storage.createNewsPost(post);
      }
    }
  } catch (error) {
    console.error("Error initializing default data:", error);
  }
}
