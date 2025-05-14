import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { amazonFlexService } from "./amazon/service";
import { z } from "zod";
import { 
  insertUserSchema,
  insertLocationSettingSchema,
  insertSearchSettingSchema,
  insertActivityLogSchema,
  insertOfferSchema
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Session setup
  app.use(
    session({
      store: new MemoryStoreSession({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      secret: process.env.SESSION_SECRET || "amazon-flex-bot-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      },
    })
  );
  
  // Passport setup
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  
  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Not authenticated" });
  };
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsedUser = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(parsedUser.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(parsedUser);
      // Create default search settings
      await storage.createSearchSettings({
        userId: user.id,
        strategy: "steady",
        autoSolveCaptcha: true,
        stopAfterAccepted: false,
        timezone: "Etc/Greenwich",
        schedule: {
          "monday": { enabled: true, startTime: "00:00", endTime: "23:59" },
          "tuesday": { enabled: true, startTime: "00:00", endTime: "23:59" },
          "wednesday": { enabled: true, startTime: "00:00", endTime: "23:59" },
          "thursday": { enabled: true, startTime: "00:00", endTime: "23:59" },
          "friday": { enabled: true, startTime: "00:00", endTime: "23:59" },
          "saturday": { enabled: true, startTime: "00:00", endTime: "23:59" },
          "sunday": { enabled: true, startTime: "00:00", endTime: "23:59" }
        }
      });
      
      await storage.createActivityLog({
        userId: user.id,
        action: "ACCOUNT_CREATED",
        details: "Account created successfully"
      });
      
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after registration" });
        }
        res.status(201).json({ user: { id: user.id, username: user.username } });
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: err.errors });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });
  
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Internal server error during login" });
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid username or password" });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Login session error:", loginErr);
          return res.status(500).json({ message: "Failed to establish login session" });
        }
        
        req.session.userId = user.id;
        
        // Log activity
        storage.createActivityLog({
          userId: user.id,
          action: "USER_LOGIN",
          details: "User logged in"
        }).catch(logErr => {
          console.error("Error logging activity:", logErr);
        });
        
        return res.json({ user: { id: user.id, username: user.username } });
      });
    })(req, res, next);
  });
  
  app.post("/api/auth/logout", (req, res) => {
    const userId = req.session.userId;
    
    // Log activity if user was logged in
    if (userId) {
      storage.createActivityLog({
        userId,
        action: "USER_LOGOUT",
        details: "User logged out"
      });
    }
    
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Session destruction failed" });
        }
        res.json({ message: "Logged out successfully" });
      });
    });
  });
  
  // User routes
  app.get("/api/user", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    res.json({ user: { id: user.id, username: user.username, amazonEmail: user.amazonEmail, notificationNumber: user.notificationNumber } });
  });
  
  app.patch("/api/user", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const updateSchema = z.object({
        amazonEmail: z.string().optional(),
        notificationNumber: z.string().optional(),
      });
      
      const parsedData = updateSchema.parse(req.body);
      const updatedUser = await storage.updateUser(user.id, parsedData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      await storage.createActivityLog({
        userId: user.id,
        action: "USER_UPDATED",
        details: "User information updated"
      });
      
      res.json({ 
        user: { 
          id: updatedUser.id, 
          username: updatedUser.username, 
          amazonEmail: updatedUser.amazonEmail,
          notificationNumber: updatedUser.notificationNumber
        } 
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: err.errors });
      }
      res.status(500).json({ message: "Update failed" });
    }
  });
  
  app.post("/api/amazon/auth", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      const authSchema = z.object({
        amazonAuthUrl: z.string()
      });
      
      const { amazonAuthUrl } = authSchema.parse(req.body);
      
      // In a real implementation, we would parse the OAuth token from the URL
      // and use it to authenticate with Amazon's APIs
      
      // For demonstration, we'll simply extract the user ID
      let amazonUserId = "";
      
      try {
        // Extract the user ID from the URL
        const match = amazonAuthUrl.match(/id%2F([^&]+)/);
        if (match && match[1]) {
          amazonUserId = decodeURIComponent(match[1]);
        }
      } catch (error) {
        return res.status(400).json({ message: "Invalid Amazon authentication URL" });
      }
      
      if (!amazonUserId) {
        return res.status(400).json({ message: "Could not extract Amazon user ID from URL" });
      }
      
      // Update the user's Amazon email (which serves as the user ID)
      const updatedUser = await storage.updateUser(user.id, { amazonEmail: amazonUserId });
      
      await storage.createActivityLog({
        userId: user.id,
        action: "AMAZON_ACCOUNT_LINKED",
        details: "Amazon Flex account successfully linked"
      });
      
      res.json({ 
        success: true,
        user: { 
          id: updatedUser!.id, 
          username: updatedUser!.username, 
          amazonEmail: updatedUser!.amazonEmail,
          notificationNumber: updatedUser!.notificationNumber
        }
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: err.errors });
      }
      console.error("Amazon auth error:", err);
      res.status(500).json({ message: "Authentication failed" });
    }
  });
  
  // Location settings routes
  app.get("/api/locations", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const locations = await storage.getLocationSettings(user.id);
    res.json({ locations });
  });
  
  app.post("/api/locations", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const parsedData = insertLocationSettingSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      const location = await storage.createLocationSetting(parsedData);
      
      await storage.createActivityLog({
        userId: user.id,
        action: "LOCATION_ADDED",
        details: `Location added: ${location.name}`
      });
      
      res.status(201).json({ location });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create location" });
    }
  });
  
  app.patch("/api/locations/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const locationId = parseInt(req.params.id);
      
      // Verify ownership
      const location = await storage.getLocationSetting(locationId);
      if (!location || location.userId !== user.id) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      const updateSchema = z.object({
        enabled: z.boolean().optional(),
        minPay: z.number().nonnegative().optional(),
        minHourlyPay: z.number().nonnegative().optional(),
        arrivalBuffer: z.number().nonnegative().optional(),
        minShiftDuration: z.number().nonnegative().optional(),
        maxShiftDuration: z.number().nonnegative().optional(),
      });
      
      const parsedData = updateSchema.parse(req.body);
      const updatedLocation = await storage.updateLocationSetting(locationId, parsedData);
      
      await storage.createActivityLog({
        userId: user.id,
        action: "LOCATION_UPDATED",
        details: `Location updated: ${location.name}`
      });
      
      res.json({ location: updatedLocation });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: err.errors });
      }
      res.status(500).json({ message: "Update failed" });
    }
  });
  
  app.delete("/api/locations/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const locationId = parseInt(req.params.id);
      
      // Verify ownership
      const location = await storage.getLocationSetting(locationId);
      if (!location || location.userId !== user.id) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      const result = await storage.deleteLocationSetting(locationId);
      
      await storage.createActivityLog({
        userId: user.id,
        action: "LOCATION_DELETED",
        details: `Location deleted: ${location.name}`
      });
      
      res.json({ success: result });
    } catch (err) {
      res.status(500).json({ message: "Deletion failed" });
    }
  });
  
  // Search settings routes
  app.get("/api/search-settings", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const settings = await storage.getSearchSettings(user.id);
    
    if (!settings) {
      return res.status(404).json({ message: "Search settings not found" });
    }
    
    res.json({ settings });
  });
  
  app.patch("/api/search-settings", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      const updateSchema = z.object({
        strategy: z.enum(["short", "steady"]).optional(),
        autoSolveCaptcha: z.boolean().optional(),
        stopAfterAccepted: z.boolean().optional(),
        timezone: z.string().optional(),
        schedule: z.record(z.object({
          enabled: z.boolean(),
          startTime: z.string(),
          endTime: z.string()
        })).optional(),
      });
      
      const parsedData = updateSchema.parse(req.body);
      const updatedSettings = await storage.updateSearchSettings(user.id, parsedData);
      
      if (!updatedSettings) {
        // Create settings if they don't exist
        const newSettings = await storage.createSearchSettings({
          userId: user.id,
          ...parsedData,
          strategy: parsedData.strategy || "steady",
          autoSolveCaptcha: parsedData.autoSolveCaptcha ?? true,
          stopAfterAccepted: parsedData.stopAfterAccepted ?? false,
          timezone: parsedData.timezone || "Etc/Greenwich",
          schedule: parsedData.schedule || {
            "monday": { enabled: true, startTime: "00:00", endTime: "23:59" },
            "tuesday": { enabled: true, startTime: "00:00", endTime: "23:59" },
            "wednesday": { enabled: true, startTime: "00:00", endTime: "23:59" },
            "thursday": { enabled: true, startTime: "00:00", endTime: "23:59" },
            "friday": { enabled: true, startTime: "00:00", endTime: "23:59" },
            "saturday": { enabled: true, startTime: "00:00", endTime: "23:59" },
            "sunday": { enabled: true, startTime: "00:00", endTime: "23:59" }
          }
        });
        
        await storage.createActivityLog({
          userId: user.id,
          action: "SEARCH_SETTINGS_CREATED",
          details: "Search settings created"
        });
        
        return res.json({ settings: newSettings });
      }
      
      await storage.createActivityLog({
        userId: user.id,
        action: "SEARCH_SETTINGS_UPDATED",
        details: "Search settings updated"
      });
      
      res.json({ settings: updatedSettings });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: err.errors });
      }
      res.status(500).json({ message: "Update failed" });
    }
  });
  
  // Activity log routes
  app.get("/api/activity-logs", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const logs = await storage.getActivityLogs(user.id, limit);
    res.json({ logs });
  });
  
  // Offers routes
  app.get("/api/offers", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offers = await storage.getOffers(user.id, limit);
    res.json({ offers });
  });
  
  // Amazon Flex search control routes
  app.post("/api/flex/start", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      // Check if user has Amazon credentials
      if (!user.amazonEmail || !user.amazonPassword) {
        return res.status(400).json({ message: "Amazon Flex credentials not set" });
      }
      
      // Check if search is already running
      const activeSession = await storage.getActiveSearchSession(user.id);
      if (activeSession) {
        return res.status(400).json({ message: "Search is already running" });
      }
      
      // Get user preferences
      const searchSettings = await storage.getSearchSettings(user.id);
      const locations = await storage.getLocationSettings(user.id);
      
      if (!searchSettings) {
        return res.status(400).json({ message: "Search settings not found" });
      }
      
      if (!locations || locations.length === 0) {
        return res.status(400).json({ message: "No locations configured" });
      }
      
      // Start a new search session
      const session = await storage.createSearchSession({
        userId: user.id,
        status: "running"
      });
      
      // Log activity
      await storage.createActivityLog({
        userId: user.id,
        action: "SEARCH_STARTED",
        details: "Amazon Flex search started"
      });
      
      // Start the search (in a production app, this would be a background process)
      // For this demo, we'll just simulate it
      
      res.json({ 
        success: true,
        session,
        message: "Search started successfully" 
      });
    } catch (err) {
      console.error("Start search error:", err);
      res.status(500).json({ message: "Failed to start search" });
    }
  });
  
  app.post("/api/flex/stop", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      // Get active session
      const activeSession = await storage.getActiveSearchSession(user.id);
      if (!activeSession) {
        return res.status(400).json({ message: "No active search to stop" });
      }
      
      // Update session
      const now = new Date();
      await storage.updateSearchSession(activeSession.id, {
        status: "stopped",
        endTime: now
      });
      
      // Log activity
      await storage.createActivityLog({
        userId: user.id,
        action: "SEARCH_STOPPED",
        details: "Amazon Flex search stopped"
      });
      
      res.json({ 
        success: true,
        message: "Search stopped successfully" 
      });
    } catch (err) {
      console.error("Stop search error:", err);
      res.status(500).json({ message: "Failed to stop search" });
    }
  });
  
  app.get("/api/flex/status", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      // Get active session
      const activeSession = await storage.getActiveSearchSession(user.id);
      const isActive = !!activeSession;
      
      // Get search stats
      let stats = {
        searchTimeToday: 0,
        acceptedShiftsThisWeek: 0
      };
      
      if (isActive && activeSession.startTime) {
        const now = new Date();
        const searchMinutes = Math.floor((now.getTime() - activeSession.startTime.getTime()) / (1000 * 60));
        stats.searchTimeToday = searchMinutes;
      }
      
      // Count accepted shifts this week
      const offers = await storage.getOffers(user.id);
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      stats.acceptedShiftsThisWeek = offers.filter(
        offer => {
          if (!offer.accepted) return false;
          // If timestamp is missing for some reason, use the offer's start time instead
          const offerDate = offer.timestamp ? new Date(offer.timestamp) : new Date(offer.startTime);
          return offerDate >= startOfWeek;
        }
      ).length;
      
      res.json({ 
        isActive,
        session: activeSession,
        stats
      });
    } catch (err) {
      console.error("Get status error:", err);
      res.status(500).json({ message: "Failed to get search status" });
    }
  });

  return httpServer;
}
