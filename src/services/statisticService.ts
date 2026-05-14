import api from './api';

export interface TopSellingProductDTO {
  productId: number;
  productName: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface RevenueDTO {
  label: string;
  revenue: number;
  orderCount: number;
}

export interface DailyStatisticDTO {
  statDate: string;
  revenue: number;
  orderCount: number;
  newUserCount: number;
}

const statisticService = {
  triggerSync: async () => {
    const response = await api.post<string>('/statistics/trigger-sync');
    return response.data;
  },

  getTopSelling: async (month: number = 0, year: number = 0, limit: number = 5) => {
    const response = await api.get<TopSellingProductDTO[]>('/statistics/top-selling', {
      params: { month, year, limit }
    });
    return response.data;
  },

  getRevenue: async (year: number = 0) => {
    const response = await api.get<RevenueDTO[]>('/statistics/revenue', {
      params: { year }
    });
    return response.data;
  },

  getDailyStats: async (month: number = 0, year: number = 0) => {
    const response = await api.get<DailyStatisticDTO[]>('/statistics/daily', {
      params: { month, year }
    });
    return response.data;
  }
};

export default statisticService;
