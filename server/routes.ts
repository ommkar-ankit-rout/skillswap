import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

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

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}