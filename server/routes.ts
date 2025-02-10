import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertSkillSchema, insertItemSchema } from "@shared/schema";
import { z } from "zod";

// Store WebSocket connections with their associated user IDs
const clients = new Map<number, WebSocket>();

export function registerRoutes(app: Express): Server {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      let user = await storage.getUserByFirebaseId(userData.firebaseId);

      if (!user) {
        user = await storage.createUser(userData);
      }

      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data" });
        return;
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // User routes
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, userData);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data" });
        return;
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Skills routes
  app.get("/api/skills", async (req, res) => {
    try {
      const skills = await storage.getSkills();
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/skills", async (req, res) => {
    try {
      const skillData = insertSkillSchema.parse(req.body);
      const skill = await storage.createSkill(skillData);
      res.json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid skill data" });
        return;
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Items routes
  app.get("/api/items", async (req, res) => {
    try {
      const items = await storage.getItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/items", async (req, res) => {
    try {
      const itemData = insertItemSchema.parse(req.body);
      const item = await storage.createItem(itemData);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid item data" });
        return;
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Initialize WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    ws.on('message', (rawData) => {
      try {
        const data = JSON.parse(rawData.toString());

        // Handle user authentication
        if (data.type === 'auth') {
          const userId = data.userId;
          clients.set(userId, ws);
          return;
        }

        // Handle chat messages
        if (data.type === 'chat') {
          const { senderId, receiverId, message } = data;
          const receiverWs = clients.get(receiverId);

          if (receiverWs?.readyState === WebSocket.OPEN) {
            receiverWs.send(JSON.stringify({
              type: 'chat',
              senderId,
              message,
              timestamp: new Date().toISOString()
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      // Remove disconnected clients
      for (const [userId, client] of clients.entries()) {
        if (client === ws) {
          clients.delete(userId);
          break;
        }
      }
    });
  });

  return httpServer;
}