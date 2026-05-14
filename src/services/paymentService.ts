import api from './api';

const paymentService = {
  createMomoPayment: async (orderId: string, amount: number) => {
    const response = await api.post<{ payUrl: string }>('/payment/momo/create', { orderId, amount });
    return response.data;
  },

  momoIpnHandler: async (payload: any) => {
    const response = await api.post('/payment/momo/ipn', payload);
    return response.data;
  }
};

export default paymentService;
