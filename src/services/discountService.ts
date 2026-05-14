import api from './api';

export interface DiscountDTO {
  id?: number;
  name: string;
  discountPercent: number;
  scope: string;
  categoryId?: number;
  brandId?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

const discountService = {
  getAllDiscounts: async () => {
    const response = await api.get<DiscountDTO[]>('/discounts');
    return response.data;
  },

  getActiveDiscounts: async () => {
    const response = await api.get<DiscountDTO[]>('/discounts/active');
    return response.data;
  },

  getDiscountById: async (id: number) => {
    const response = await api.get<DiscountDTO>(`/discounts/${id}`);
    return response.data;
  },

  createDiscount: async (data: DiscountDTO) => {
    const response = await api.post<DiscountDTO>('/discounts', data);
    return response.data;
  },

  updateDiscount: async (id: number, data: Partial<DiscountDTO>) => {
    const response = await api.put<DiscountDTO>(`/discounts/${id}`, data);
    return response.data;
  },

  deleteDiscount: async (id: number) => {
    await api.delete(`/discounts/${id}`);
  }
};

export default discountService;
