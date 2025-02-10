import { users, skills, items, type User, type InsertUser, type Skill, type InsertSkill, type Item, type InsertItem } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseId(firebaseId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;

  // Skills methods
  getSkills(): Promise<Skill[]>;
  getSkillsByUser(userId: number): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;

  // Items methods
  getItems(): Promise<Item[]>;
  getItemsByUser(userId: number): Promise<Item[]>;
  createItem(item: InsertItem): Promise<Item>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private skills: Map<number, Skill>;
  private items: Map<number, Item>;
  private currentUserId: number;
  private currentSkillId: number;
  private currentItemId: number;

  constructor() {
    this.users = new Map();
    this.skills = new Map();
    this.items = new Map();
    this.currentUserId = 1;
    this.currentSkillId = 1;
    this.currentItemId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseId(firebaseId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseId === firebaseId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user = { id, ...insertUser };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const existingUser = await this.getUser(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Skills methods
  async getSkills(): Promise<Skill[]> {
    return Array.from(this.skills.values());
  }

  async getSkillsByUser(userId: number): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(
      (skill) => skill.userId === userId
    );
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const id = this.currentSkillId++;
    const skill: Skill = {
      id,
      ...insertSkill,
      createdAt: new Date(),
    };
    this.skills.set(id, skill);
    return skill;
  }

  // Items methods
  async getItems(): Promise<Item[]> {
    return Array.from(this.items.values());
  }

  async getItemsByUser(userId: number): Promise<Item[]> {
    return Array.from(this.items.values()).filter(
      (item) => item.userId === userId
    );
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const id = this.currentItemId++;
    const item: Item = {
      id,
      ...insertItem,
      createdAt: new Date(),
    };
    this.items.set(id, item);
    return item;
  }
}

export const storage = new MemStorage();