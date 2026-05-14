import api from './api';

export interface StorePolicyDTO {
  id?: number;
  policyKey: string;
  title: string;
  content: string;
  category: string;
  isActive?: boolean;
  displayOrder?: number;
}

const storePolicyService = {
  getAllPolicies: async () => {
    const response = await api.get<StorePolicyDTO[]>('/policies');
    return response.data;
  },

  getPolicyByKey: async (key: string) => {
    const response = await api.get<StorePolicyDTO>(`/policies/${key}`);
    return response.data;
  },

  createPolicy: async (data: StorePolicyDTO) => {
    const response = await api.post<StorePolicyDTO>('/policies', data);
    return response.data;
  },

  updatePolicy: async (key: string, data: Partial<StorePolicyDTO>) => {
    const response = await api.put<StorePolicyDTO>(`/policies/${key}`, data);
    return response.data;
  },

  deletePolicy: async (key: string) => {
    await api.delete(`/policies/${key}`);
  }
};

export default storePolicyService;
