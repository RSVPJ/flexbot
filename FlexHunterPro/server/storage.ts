import { 
  users, type User, type InsertUser,
  locationSettings, type LocationSetting, type InsertLocationSetting,
  searchSettings, type SearchSetting, type InsertSearchSetting,
  activityLogs, type ActivityLog, type InsertActivityLog,
  offers, type Offer, type InsertOffer,
  searchSessions, type SearchSession, type InsertSearchSession
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;

  // Location settings operations
  getLocationSettings(userId: number): Promise<LocationSetting[]>;
  getLocationSetting(id: number): Promise<LocationSetting | undefined>;
  createLocationSetting(setting: InsertLocationSetting): Promise<LocationSetting>;
  updateLocationSetting(id: number, data: Partial<LocationSetting>): Promise<LocationSetting | undefined>;
  deleteLocationSetting(id: number): Promise<boolean>;

  // Search settings operations
  getSearchSettings(userId: number): Promise<SearchSetting | undefined>;
  createSearchSettings(settings: InsertSearchSetting): Promise<SearchSetting>;
  updateSearchSettings(userId: number, data: Partial<SearchSetting>): Promise<SearchSetting | undefined>;

  // Activity log operations
  getActivityLogs(userId: number, limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  // Offer operations
  getOffers(userId: number, limit?: number): Promise<Offer[]>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  updateOffer(id: number, data: Partial<Offer>): Promise<Offer | undefined>;

  // Search session operations
  getActiveSearchSession(userId: number): Promise<SearchSession | undefined>;
  getSearchSessions(userId: number, limit?: number): Promise<SearchSession[]>;
  createSearchSession(session: InsertSearchSession): Promise<SearchSession>;
  updateSearchSession(id: number, data: Partial<SearchSession>): Promise<SearchSession | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private locationSettings: Map<number, LocationSetting>;
  private searchSettings: Map<number, SearchSetting>;
  private activityLogs: Map<number, ActivityLog>;
  private offers: Map<number, Offer>;
  private searchSessions: Map<number, SearchSession>;
  private currentId: {
    users: number;
    locationSettings: number;
    searchSettings: number;
    activityLogs: number;
    offers: number;
    searchSessions: number;
  };

  constructor() {
    this.users = new Map();
    this.locationSettings = new Map();
    this.searchSettings = new Map();
    this.activityLogs = new Map();
    this.offers = new Map();
    this.searchSessions = new Map();
    this.currentId = {
      users: 1,
      locationSettings: 1,
      searchSettings: 1,
      activityLogs: 1,
      offers: 1,
      searchSessions: 1
    };
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Location settings operations
  async getLocationSettings(userId: number): Promise<LocationSetting[]> {
    return Array.from(this.locationSettings.values()).filter(
      (setting) => setting.userId === userId
    );
  }

  async getLocationSetting(id: number): Promise<LocationSetting | undefined> {
    return this.locationSettings.get(id);
  }

  async createLocationSetting(setting: InsertLocationSetting): Promise<LocationSetting> {
    const id = this.currentId.locationSettings++;
    const locationSetting: LocationSetting = { ...setting, id };
    this.locationSettings.set(id, locationSetting);
    return locationSetting;
  }

  async updateLocationSetting(id: number, data: Partial<LocationSetting>): Promise<LocationSetting | undefined> {
    const existingSetting = this.locationSettings.get(id);
    if (!existingSetting) return undefined;
    
    const updatedSetting = { ...existingSetting, ...data };
    this.locationSettings.set(id, updatedSetting);
    return updatedSetting;
  }

  async deleteLocationSetting(id: number): Promise<boolean> {
    return this.locationSettings.delete(id);
  }

  // Search settings operations
  async getSearchSettings(userId: number): Promise<SearchSetting | undefined> {
    return Array.from(this.searchSettings.values()).find(
      (setting) => setting.userId === userId
    );
  }

  async createSearchSettings(settings: InsertSearchSetting): Promise<SearchSetting> {
    const id = this.currentId.searchSettings++;
    const searchSetting: SearchSetting = { ...settings, id };
    this.searchSettings.set(id, searchSetting);
    return searchSetting;
  }

  async updateSearchSettings(userId: number, data: Partial<SearchSetting>): Promise<SearchSetting | undefined> {
    const existingSetting = Array.from(this.searchSettings.values()).find(
      (setting) => setting.userId === userId
    );
    
    if (!existingSetting) return undefined;
    
    const updatedSetting = { ...existingSetting, ...data };
    this.searchSettings.set(existingSetting.id, updatedSetting);
    return updatedSetting;
  }

  // Activity log operations
  async getActivityLogs(userId: number, limit: number = 100): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter((log) => log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const id = this.currentId.activityLogs++;
    const now = new Date();
    const activityLog: ActivityLog = { 
      ...log, 
      id, 
      timestamp: now
    };
    this.activityLogs.set(id, activityLog);
    return activityLog;
  }

  // Offer operations
  async getOffers(userId: number, limit: number = 100): Promise<Offer[]> {
    return Array.from(this.offers.values())
      .filter((offer) => offer.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createOffer(offer: InsertOffer): Promise<Offer> {
    const id = this.currentId.offers++;
    const now = new Date();
    const newOffer: Offer = { 
      ...offer, 
      id, 
      timestamp: now
    };
    this.offers.set(id, newOffer);
    return newOffer;
  }

  async updateOffer(id: number, data: Partial<Offer>): Promise<Offer | undefined> {
    const existingOffer = this.offers.get(id);
    if (!existingOffer) return undefined;
    
    const updatedOffer = { ...existingOffer, ...data };
    this.offers.set(id, updatedOffer);
    return updatedOffer;
  }

  // Search session operations
  async getActiveSearchSession(userId: number): Promise<SearchSession | undefined> {
    return Array.from(this.searchSessions.values()).find(
      (session) => session.userId === userId && session.status === "running"
    );
  }

  async getSearchSessions(userId: number, limit: number = 100): Promise<SearchSession[]> {
    return Array.from(this.searchSessions.values())
      .filter((session) => session.userId === userId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  async createSearchSession(session: InsertSearchSession): Promise<SearchSession> {
    const id = this.currentId.searchSessions++;
    const now = new Date();
    const searchSession: SearchSession = { 
      ...session, 
      id, 
      startTime: now,
      endTime: null,
      offersFound: 0,
      offersAccepted: 0
    };
    this.searchSessions.set(id, searchSession);
    return searchSession;
  }

  async updateSearchSession(id: number, data: Partial<SearchSession>): Promise<SearchSession | undefined> {
    const existingSession = this.searchSessions.get(id);
    if (!existingSession) return undefined;
    
    const updatedSession = { ...existingSession, ...data };
    this.searchSessions.set(id, updatedSession);
    return updatedSession;
  }
}

import { DatabaseStorage } from "./database-storage";

// Switch from MemStorage to DatabaseStorage
export const storage = new DatabaseStorage();
