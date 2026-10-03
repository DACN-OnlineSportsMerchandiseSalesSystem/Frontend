import api from './api';

export interface VNPayReturnResponse {
  success: boolean;
  responseCode: string;
  message: string;
  orderId: string;
  amount: number;
  transactionNo: string;
  bankCode: string;
  payDate: string;
}

const paymentService = {
  // Tạo liên kết thanh toán VNPay
  createVNPayPayment: async (orderId: number | string): Promise<string> => {
    const response = await api.post<string>(`/payment/vnpay/create?orderId=${orderId}`);
    return typeof response.data === 'string' ? response.data : (response.data as any)?.payUrl || String(response.data);
  },

  // Xử lý callback trả về từ VNPay
  handleVNPayReturn: async (params: Record<string, string>): Promise<VNPayReturnResponse> => {
    const response = await api.get<VNPayReturnResponse>('/payment/vnpay/return', { params });
    return response.data;
  },

  // Tạo liên kết thanh toán MoMo
  createMomoPayment: async (orderId: number | string, amount?: number): Promise<string> => {
    const response = await api.post<any>(`/payment/momo/create?orderId=${orderId}`, { orderId, amount });
    return typeof response.data === 'string' ? response.data : response.data?.payUrl;
  },

  momoIpnHandler: async (payload: any) => {
    const response = await api.post('/payment/momo/ipn', payload);
    return response.data;
  }
};

export default paymentService;
