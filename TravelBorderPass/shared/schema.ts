import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'admin', 'tourist', 'sag', 'pdi'
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  rut: text("rut"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const processes = pgTable("processes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'minors', 'vehicles', 'declaration'
  status: text("status").notNull().default('pending'), // 'pending', 'sag_review', 'pdi_review', 'approved', 'rejected'
  formData: jsonb("form_data").notNull(),
  sagStatus: text("sag_status"), // 'pending', 'approved', 'rejected'
  sagObservations: text("sag_observations"),
  pdiStatus: text("pdi_status"), // 'pending', 'approved', 'rejected', 'observed'
  pdiObservations: text("pdi_observations"),
  finalStatus: text("final_status"), // 'approved', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  processId: integer("process_id"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'info', 'success', 'warning', 'error'
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  processId: integer("process_id"),
  action: text("action").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'daily', 'monthly', 'annual', 'custom'
  parameters: jsonb("parameters"),
  generatedBy: integer("generated_by").notNull(),
  filePath: text("file_path"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
  email: true,
  phone: true,
  rut: true,
});

export const insertProcessSchema = createInsertSchema(processes).pick({
  userId: true,
  type: true,
  formData: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  processId: true,
  title: true,
  message: true,
  type: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLog).pick({
  userId: true,
  processId: true,
  action: true,
  details: true,
});

export const insertReportSchema = createInsertSchema(reports).pick({
  type: true,
  parameters: true,
  generatedBy: true,
  filePath: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Process = typeof processes.$inferSelect;
export type InsertProcess = z.infer<typeof insertProcessSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
