import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseId: text("firebase_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  profilePicture: text("profile_picture"),
  bio: text("bio"),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "offering" or "learning"
  createdAt: timestamp("created_at").defaultNow(),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  status: text("status").notNull(), // "available" or "exchanged"
  createdAt: timestamp("created_at").defaultNow(),
});

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  userOneId: integer("user_one_id").references(() => users.id),
  userTwoId: integer("user_two_id").references(() => users.id),
  lastMessage: text("last_message"),
  lastMessageTime: timestamp("last_message_time"),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").references(() => chats.id),
  senderId: integer("sender_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertSkillSchema = createInsertSchema(skills).omit({ id: true, createdAt: true });
export const insertItemSchema = createInsertSchema(items).omit({ id: true, createdAt: true });
export const insertChatSchema = createInsertSchema(chats).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type Item = typeof items.$inferSelect;
export type Chat = typeof chats.$inferSelect;
export type Message = typeof messages.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type InsertChat = z.infer<typeof insertChatSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
