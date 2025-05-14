import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  amazonEmail: text("amazon_email"),
  amazonPassword: text("amazon_password"),
  notificationNumber: text("notification_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  amazonEmail: true,
  amazonPassword: true,
  notificationNumber: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const locationSettings = pgTable("location_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  code: text("code").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  isUlez: boolean("is_ulez").default(false),
  enabled: boolean("enabled").default(true),
  minPay: integer("min_pay").default(0),
  minHourlyPay: integer("min_hourly_pay").default(0),
  arrivalBuffer: integer("arrival_buffer").default(60),
  minShiftDuration: integer("min_shift_duration").default(0),
  maxShiftDuration: integer("max_shift_duration").default(24),
});

export const insertLocationSettingSchema = createInsertSchema(locationSettings).pick({
  userId: true,
  code: true,
  name: true,
  address: true,
  isUlez: true,
  enabled: true,
  minPay: true,
  minHourlyPay: true,
  arrivalBuffer: true,
  minShiftDuration: true,
  maxShiftDuration: true,
});

export type InsertLocationSetting = z.infer<typeof insertLocationSettingSchema>;
export type LocationSetting = typeof locationSettings.$inferSelect;

export const searchSettings = pgTable("search_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  strategy: text("strategy").notNull().default("steady"),
  autoSolveCaptcha: boolean("auto_solve_captcha").default(true),
  stopAfterAccepted: boolean("stop_after_accepted").default(false),
  timezone: text("timezone").default("Etc/Greenwich"),
  schedule: json("schedule").$type<{
    [key: string]: { enabled: boolean; startTime: string; endTime: string }
  }>(),
});

export const insertSearchSettingSchema = createInsertSchema(searchSettings).pick({
  userId: true,
  strategy: true,
  autoSolveCaptcha: true,
  stopAfterAccepted: true,
  timezone: true,
  schedule: true,
});

export type InsertSearchSetting = z.infer<typeof insertSearchSettingSchema>;
export type SearchSetting = typeof searchSettings.$inferSelect;

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  details: text("details"),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).pick({
  userId: true,
  action: true,
  details: true,
});

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  locationCode: text("location_code").notNull(),
  locationName: text("location_name").notNull(),
  locationAddress: text("location_address").notNull(),
  isUlez: boolean("is_ulez").default(false),
  pay: integer("pay").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  durationHours: integer("duration_hours").notNull(),
  hourlyRate: integer("hourly_rate").notNull(),
  accepted: boolean("accepted").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertOfferSchema = createInsertSchema(offers).pick({
  userId: true,
  locationCode: true,
  locationName: true,
  locationAddress: true,
  isUlez: true,
  pay: true,
  startTime: true,
  endTime: true,
  durationHours: true,
  hourlyRate: true,
  accepted: true,
});

export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offers.$inferSelect;

export const searchSessions = pgTable("search_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  status: text("status").default("running"),
  offersFound: integer("offers_found").default(0),
  offersAccepted: integer("offers_accepted").default(0),
});

export const insertSearchSessionSchema = createInsertSchema(searchSessions).pick({
  userId: true,
  status: true,
});

export type InsertSearchSession = z.infer<typeof insertSearchSessionSchema>;
export type SearchSession = typeof searchSessions.$inferSelect;
