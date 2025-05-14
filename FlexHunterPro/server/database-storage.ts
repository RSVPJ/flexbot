import { 
  users, type User, type InsertUser,
  locationSettings, type LocationSetting, type InsertLocationSetting,
  searchSettings, type SearchSetting, type InsertSearchSetting,
  activityLogs, type ActivityLog, type InsertActivityLog,
  offers, type Offer, type InsertOffer,
  searchSessions, type SearchSession, type InsertSearchSession
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Location settings operations
  async getLocationSettings(userId: number): Promise<LocationSetting[]> {
    return db
      .select()
      .from(locationSettings)
      .where(eq(locationSettings.userId, userId));
  }

  async getLocationSetting(id: number): Promise<LocationSetting | undefined> {
    const [setting] = await db
      .select()
      .from(locationSettings)
      .where(eq(locationSettings.id, id));
    return setting;
  }

  async createLocationSetting(setting: InsertLocationSetting): Promise<LocationSetting> {
    const [createdSetting] = await db
      .insert(locationSettings)
      .values(setting)
      .returning();
    return createdSetting;
  }

  async updateLocationSetting(
    id: number,
    data: Partial<LocationSetting>
  ): Promise<LocationSetting | undefined> {
    const [updatedSetting] = await db
      .update(locationSettings)
      .set(data)
      .where(eq(locationSettings.id, id))
      .returning();
    return updatedSetting;
  }

  async deleteLocationSetting(id: number): Promise<boolean> {
    const result = await db
      .delete(locationSettings)
      .where(eq(locationSettings.id, id));
    return true;
  }

  // Search settings operations
  async getSearchSettings(userId: number): Promise<SearchSetting | undefined> {
    const [settings] = await db
      .select()
      .from(searchSettings)
      .where(eq(searchSettings.userId, userId));
    return settings;
  }

  async createSearchSettings(settings: InsertSearchSetting): Promise<SearchSetting> {
    const [createdSettings] = await db
      .insert(searchSettings)
      .values(settings)
      .returning();
    return createdSettings;
  }

  async updateSearchSettings(
    userId: number,
    data: Partial<SearchSetting>
  ): Promise<SearchSetting | undefined> {
    const [updatedSettings] = await db
      .update(searchSettings)
      .set(data)
      .where(eq(searchSettings.userId, userId))
      .returning();
    return updatedSettings;
  }

  // Activity log operations
  async getActivityLogs(userId: number, limit: number = 100): Promise<ActivityLog[]> {
    return db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.timestamp))
      .limit(limit);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [createdLog] = await db
      .insert(activityLogs)
      .values(log)
      .returning();
    return createdLog;
  }

  // Offer operations
  async getOffers(userId: number, limit: number = 100): Promise<Offer[]> {
    return db
      .select()
      .from(offers)
      .where(eq(offers.userId, userId))
      .orderBy(desc(offers.timestamp))
      .limit(limit);
  }

  async createOffer(offer: InsertOffer): Promise<Offer> {
    const [createdOffer] = await db
      .insert(offers)
      .values(offer)
      .returning();
    return createdOffer;
  }

  async updateOffer(id: number, data: Partial<Offer>): Promise<Offer | undefined> {
    const [updatedOffer] = await db
      .update(offers)
      .set(data)
      .where(eq(offers.id, id))
      .returning();
    return updatedOffer;
  }

  // Search session operations
  async getActiveSearchSession(userId: number): Promise<SearchSession | undefined> {
    const [session] = await db
      .select()
      .from(searchSessions)
      .where(
        and(
          eq(searchSessions.userId, userId),
          eq(searchSessions.status, "running")
        )
      );
    return session;
  }

  async getSearchSessions(userId: number, limit: number = 100): Promise<SearchSession[]> {
    return db
      .select()
      .from(searchSessions)
      .where(eq(searchSessions.userId, userId))
      .orderBy(desc(searchSessions.startTime))
      .limit(limit);
  }

  async createSearchSession(session: InsertSearchSession): Promise<SearchSession> {
    const [createdSession] = await db
      .insert(searchSessions)
      .values(session)
      .returning();
    return createdSession;
  }

  async updateSearchSession(
    id: number,
    data: Partial<SearchSession>
  ): Promise<SearchSession | undefined> {
    const [updatedSession] = await db
      .update(searchSessions)
      .set(data)
      .where(eq(searchSessions.id, id))
      .returning();
    return updatedSession;
  }
}