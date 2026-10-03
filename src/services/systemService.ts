import api from './api';

export interface SystemHealth {
  database: string;
  redis: string;
  elasticsearch: string;
  chroma: string;
}

export interface AuditLog {
  id: number;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  detail: string;
  ipAddress: string;
  createdAt: string;
}

const systemService = {
  getSystemHealth: async () => {
    const response = await api.get<SystemHealth>('/admin/system/health');
    return response.data;
  },

  clearCache: async () => {
    const response = await api.post<string>('/admin/system/clear-cache');
    return response.data;
  },

  getAuditLogs: async () => {
    const response = await api.get<AuditLog[]>('/admin/system/audit-logs');
    return response.data;
  },

  resetVector: async () => {
    const response = await api.post<string>('/admin/system/reset-vector');
    return response.data;
  }
};

export default systemService;
