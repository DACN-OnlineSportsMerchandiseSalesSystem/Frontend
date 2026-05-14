import api from './api';

export interface Voucher {
  id: number;
  code: string;
  discountAmount: number;
  minOrderValue: number;
  usageLimit: number;
  usedCount: number;
  expiryDate: string;
  createdAt?: string;
  categoryId?: number;
  categoryName?: string;
  brandId?: number;
  brandName?: string;
}

const voucherService = {
  // Public Endpoints
  getValidVouchers: async () => {
    const response = await api.get<Voucher[]>('/vouchers/valid');
    return response.data;
  },

  getAllVouchers: async () => {
    const response = await api.get<Voucher[]>('/vouchers');
    return response.data;
  },

  // Admin Endpoints
  getAllVouchersAdmin: async () => {
    const response = await api.get<Voucher[]>('/vouchers/admin');
    return response.data;
  },

  getVoucherByIdAdmin: async (id: number) => {
    const response = await api.get<Voucher>(`/vouchers/admin/${id}`);
    return response.data;
  },

  createVoucherAdmin: async (data: Partial<Voucher>) => {
    const response = await api.post<Voucher>('/vouchers/admin', data);
    return response.data;
  },

  updateVoucherAdmin: async (id: number, data: Partial<Voucher>) => {
    const response = await api.put<Voucher>(`/vouchers/admin/${id}`, data);
    return response.data;
  },

  deleteVoucherAdmin: async (id: number) => {
    await api.delete(`/vouchers/admin/${id}`);
  }
};

export default voucherService;
