import api from './api';

export interface StorePolicy {
  id?: number;
  key: string;
  title: string;
  content: string;
  icon?: string;
  lastUpdated?: string;
}

export const policyService = {
  getAllPolicies: async () => {
    const response = await api.get<StorePolicy[]>('/policies');
    return response.data;
  },
  getPolicyByKey: async (key: string) => {
    const response = await api.get<StorePolicy>(`/policies/${key}`);
    return response.data;
  }
};

export interface ReturnRequest {
  id?: number;
  orderId: number;
  reason: string;
  note?: string;
  status?: string;
  items: {
    productVariantId: number;
    quantity: number;
  }[];
}

export const returnService = {
  createReturn: async (data: any) => {
    const response = await api.post('/returns', data);
    return response.data;
  },
  getMyReturns: async () => {
    const response = await api.get('/returns/my-returns');
    return response.data;
  }
};
