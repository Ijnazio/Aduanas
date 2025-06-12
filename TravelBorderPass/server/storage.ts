import { 
  users, processes, notifications, activityLog, reports,
  type User, type InsertUser, type Process, type InsertProcess,
  type Notification, type InsertNotification, type ActivityLog, type InsertActivityLog,
  type Report, type InsertReport
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Processes
  getProcess(id: number): Promise<Process | undefined>;
  getProcessesByUser(userId: number): Promise<Process[]>;
  getProcessesByStatus(status: string): Promise<Process[]>;
  getProcessesByRole(role: string): Promise<Process[]>;
  createProcess(process: InsertProcess): Promise<Process>;
  updateProcess(id: number, updates: Partial<Process>): Promise<Process | undefined>;
  
  // Notifications
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  
  // Activity Log
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogByProcess(processId: number): Promise<ActivityLog[]>;
  
  // Reports
  createReport(report: InsertReport): Promise<Report>;
  getReportsByUser(userId: number): Promise<Report[]>;
  
  // Statistics
  getDashboardStats(): Promise<{
    totalCrossings: number;
    totalVehicles: number;
    avgProcessingTime: number;
    efficiency: number;
    todayStats: {
      crossings: number;
      vehicles: number;
      avgTime: number;
    };
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private processes: Map<number, Process>;
  private notifications: Map<number, Notification>;
  private activityLogs: Map<number, ActivityLog>;
  private reports: Map<number, Report>;
  private currentIds: {
    users: number;
    processes: number;
    notifications: number;
    activityLogs: number;
    reports: number;
  };

  constructor() {
    this.users = new Map();
    this.processes = new Map();
    this.notifications = new Map();
    this.activityLogs = new Map();
    this.reports = new Map();
    this.currentIds = {
      users: 1,
      processes: 1,
      notifications: 1,
      activityLogs: 1,
      reports: 1,
    };
    
    this.seedData();
  }

  private seedData() {
    // Seed demo users
    const demoUsers = [
      { username: 'funcionario1', password: 'pass123', role: 'admin', name: 'Funcionario Aduanas', email: 'funcionario@aduana.cl', phone: '+56912345678', rut: '12345678-9' },
      { username: 'turista1', password: 'pass123', role: 'tourist', name: 'Juan Pérez', email: 'juan@email.com', phone: '+56987654321', rut: '98765432-1' },
      { username: 'sag1', password: 'pass123', role: 'sag', name: 'Inspector SAG', email: 'inspector@sag.cl', phone: '+56911111111', rut: '11111111-1' },
      { username: 'pdi1', password: 'pass123', role: 'pdi', name: 'Inspector PDI', email: 'inspector@pdi.cl', phone: '+56922222222', rut: '22222222-2' },
    ];

    demoUsers.forEach(userData => {
      const user: User = {
        id: this.currentIds.users++,
        ...userData,
        email: userData.email || null,
        phone: userData.phone || null,
        rut: userData.rut || null,
        isActive: true,
        createdAt: new Date(),
      };
      this.users.set(user.id, user);
    });

    // Seed demo processes
    const demoProcesses = [
      {
        userId: 2, // turista1
        type: 'vehicles',
        status: 'approved',
        formData: {
          patente: 'AB1234',
          marca: 'Toyota',
          modelo: 'Corolla',
          año: 2020,
          color: 'Blanco',
          propietario: 'Juan Pérez',
          rut: '98765432-1',
          fechaSalida: '2024-11-20',
          motivo: 'turismo'
        },
        sagStatus: 'approved',
        pdiStatus: 'approved',
        finalStatus: 'approved',
      },
      {
        userId: 2, // turista1
        type: 'declaration',
        status: 'sag_review',
        formData: {
          alimentos: ['frutas'],
          plantas: [],
          mascotas: false,
          descripcionAlimentos: 'Manzanas y naranjas para consumo personal'
        },
        sagStatus: 'pending',
        pdiStatus: null,
        finalStatus: null,
      }
    ];

    demoProcesses.forEach(processData => {
      const process: Process = {
        id: this.currentIds.processes++,
        ...processData,
        sagObservations: null,
        pdiObservations: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.processes.set(process.id, process);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentIds.users++,
      ...insertUser,
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getProcess(id: number): Promise<Process | undefined> {
    return this.processes.get(id);
  }

  async getProcessesByUser(userId: number): Promise<Process[]> {
    return Array.from(this.processes.values()).filter(process => process.userId === userId);
  }

  async getProcessesByStatus(status: string): Promise<Process[]> {
    return Array.from(this.processes.values()).filter(process => process.status === status);
  }

  async getProcessesByRole(role: string): Promise<Process[]> {
    if (role === 'sag') {
      return Array.from(this.processes.values()).filter(process => 
        process.status === 'sag_review' || process.sagStatus === 'pending'
      );
    }
    if (role === 'pdi') {
      return Array.from(this.processes.values()).filter(process => 
        process.status === 'pdi_review' || (process.sagStatus === 'approved' && process.pdiStatus === 'pending')
      );
    }
    return Array.from(this.processes.values());
  }

  async createProcess(insertProcess: InsertProcess): Promise<Process> {
    const process: Process = {
      id: this.currentIds.processes++,
      ...insertProcess,
      status: 'sag_review',
      sagStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.processes.set(process.id, process);
    return process;
  }

  async updateProcess(id: number, updates: Partial<Process>): Promise<Process | undefined> {
    const process = this.processes.get(id);
    if (!process) return undefined;
    
    const updatedProcess = { ...process, ...updates, updatedAt: new Date() };
    this.processes.set(id, updatedProcess);
    return updatedProcess;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      id: this.currentIds.notifications++,
      ...insertNotification,
      isRead: false,
      createdAt: new Date(),
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(id, notification);
    }
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const log: ActivityLog = {
      id: this.currentIds.activityLogs++,
      ...insertLog,
      createdAt: new Date(),
    };
    this.activityLogs.set(log.id, log);
    return log;
  }

  async getActivityLogByProcess(processId: number): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter(log => log.processId === processId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const report: Report = {
      id: this.currentIds.reports++,
      ...insertReport,
      createdAt: new Date(),
    };
    this.reports.set(report.id, report);
    return report;
  }

  async getReportsByUser(userId: number): Promise<Report[]> {
    return Array.from(this.reports.values())
      .filter(report => report.generatedBy === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getDashboardStats(): Promise<{
    totalCrossings: number;
    totalVehicles: number;
    avgProcessingTime: number;
    efficiency: number;
    todayStats: {
      crossings: number;
      vehicles: number;
      avgTime: number;
    };
  }> {
    const processes = Array.from(this.processes.values());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayProcesses = processes.filter(p => 
      p.createdAt && p.createdAt >= today
    );

    return {
      totalCrossings: processes.filter(p => p.type === 'minors').length + processes.filter(p => p.type === 'declaration').length,
      totalVehicles: processes.filter(p => p.type === 'vehicles').length,
      avgProcessingTime: 12, // Mock: 12 minutes average
      efficiency: 94, // Mock: 94% efficiency
      todayStats: {
        crossings: todayProcesses.filter(p => p.type === 'minors' || p.type === 'declaration').length,
        vehicles: todayProcesses.filter(p => p.type === 'vehicles').length,
        avgTime: 10, // Mock: 10 minutes today
      }
    };
  }
}

export const storage = new MemStorage();
