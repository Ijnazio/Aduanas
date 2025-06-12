import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProcessSchema, insertNotificationSchema, insertActivityLogSchema, insertReportSchema } from "@shared/schema";
import { z } from "zod";

// Authentication middleware
const authenticateUser = async (req: any, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  
  req.user = user;
  next();
};

// Role-based authorization middleware
const authorizeRoles = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (!user.isActive) {
        return res.status(401).json({ message: "Account is not active" });
      }
      
      // Store user session
      req.session.userId = user.id;
      req.session.username = user.username;
      
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role, 
          name: user.name,
          email: user.email,
          phone: user.phone,
          rut: user.rut
        } 
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse({
        ...req.body,
        role: 'tourist',
        isActive: false // Requires admin approval
      });
      
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Create notification for admin users about new registration
      const adminNotification = {
        userId: 1, // Admin user
        title: "Nueva Solicitud de Registro",
        message: `Usuario ${userData.name} solicita activación de cuenta`,
        type: "info" as const
      };
      await storage.createNotification(adminNotification);
      
      res.json({ message: "Registration successful. Account pending approval." });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        name: user.name,
        email: user.email,
        phone: user.phone,
        rut: user.rut,
        isActive: user.isActive
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Process routes
  app.get("/api/processes", authenticateUser, async (req: any, res) => {
    try {
      let processes;
      
      if (req.user.role === 'tourist') {
        processes = await storage.getProcessesByUser(req.user.id);
      } else if (req.user.role === 'sag' || req.user.role === 'pdi') {
        processes = await storage.getProcessesByRole(req.user.role);
      } else {
        processes = await storage.getProcessesByRole('admin');
      }
      
      res.json(processes);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/processes/:id", authenticateUser, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const process = await storage.getProcess(id);
      
      if (!process) {
        return res.status(404).json({ message: "Process not found" });
      }
      
      // Check authorization
      if (req.user.role === 'tourist' && process.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(process);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/processes", authenticateUser, async (req: any, res) => {
    try {
      const processData = insertProcessSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const process = await storage.createProcess(processData);
      
      // Create activity log
      await storage.createActivityLog({
        userId: req.user.id,
        processId: process.id,
        action: "PROCESS_CREATED",
        details: `Created ${process.type} process`
      });
      
      // Create notification for SAG
      const sagUsers = [3]; // SAG user ID
      for (const sagUserId of sagUsers) {
        await storage.createNotification({
          userId: sagUserId,
          processId: process.id,
          title: "Nuevo Trámite para Revisión",
          message: `Trámite de ${process.type} requiere revisión SAG`,
          type: "info"
        });
      }
      
      res.json(process);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/processes/:id", authenticateUser, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const process = await storage.getProcess(id);
      
      if (!process) {
        return res.status(404).json({ message: "Process not found" });
      }
      
      const updates = req.body;
      const updatedProcess = await storage.updateProcess(id, updates);
      
      // Create activity log
      await storage.createActivityLog({
        userId: req.user.id,
        processId: id,
        action: "PROCESS_UPDATED",
        details: `Updated process status or data`
      });
      
      // Handle workflow notifications
      if (updates.sagStatus === 'approved' && req.user.role === 'sag') {
        // Notify PDI
        const pdiUsers = [4]; // PDI user ID
        for (const pdiUserId of pdiUsers) {
          await storage.createNotification({
            userId: pdiUserId,
            processId: id,
            title: "Trámite Aprobado por SAG",
            message: `Trámite ID ${id} requiere revisión PDI`,
            type: "info"
          });
        }
        
        // Update process status
        await storage.updateProcess(id, { status: 'pdi_review', pdiStatus: 'pending' });
      }
      
      if (updates.pdiStatus === 'approved' && req.user.role === 'pdi') {
        // Notify Admin for final approval
        const adminUsers = [1]; // Admin user ID
        for (const adminUserId of adminUsers) {
          await storage.createNotification({
            userId: adminUserId,
            processId: id,
            title: "Trámite Listo para Aprobación Final",
            message: `Trámite ID ${id} aprobado por PDI`,
            type: "success"
          });
        }
        
        // Auto-approve if both SAG and PDI approved
        if (process.sagStatus === 'approved') {
          await storage.updateProcess(id, { 
            status: 'approved', 
            finalStatus: 'approved' 
          });
          
          // Notify tourist
          await storage.createNotification({
            userId: process.userId,
            processId: id,
            title: "Trámite Aprobado",
            message: `Su trámite ha sido aprobado exitosamente`,
            type: "success"
          });
        }
      }
      
      res.json(updatedProcess);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Notifications routes
  app.get("/api/notifications", authenticateUser, async (req: any, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.user.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/notifications/:id/read", authenticateUser, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reports routes
  app.post("/api/reports", authenticateUser, authorizeRoles(['admin']), async (req: any, res) => {
    try {
      const reportData = insertReportSchema.parse({
        ...req.body,
        generatedBy: req.user.id,
        filePath: `/reports/${Date.now()}-${req.body.type}.pdf`
      });
      
      const report = await storage.createReport(reportData);
      
      // Create activity log
      await storage.createActivityLog({
        userId: req.user.id,
        action: "REPORT_GENERATED",
        details: `Generated ${report.type} report`
      });
      
      res.json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reports", authenticateUser, authorizeRoles(['admin']), async (req: any, res) => {
    try {
      const reports = await storage.getReportsByUser(req.user.id);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", authenticateUser, authorizeRoles(['admin']), async (req: any, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Activity log
  app.get("/api/activity/:processId", authenticateUser, async (req: any, res) => {
    try {
      const processId = parseInt(req.params.processId);
      const logs = await storage.getActivityLogByProcess(processId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
