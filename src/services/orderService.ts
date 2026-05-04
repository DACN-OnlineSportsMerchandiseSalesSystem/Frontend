import api from './api';

export interface OrderItem {
  id: number;
  productName: string;
  variantInfo: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  orderCode: string;
  totalAmount: number;
  status: string;
  orderDate: string;
  receiverName: string;
  phone: string;
  address: string;
  items: OrderItem[];
}

const orderService = {
  createOrder: async (orderData: any) => {
    const response = await api.post<Order>('/orders', orderData);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get<Order[]>('/orders/my-orders');
    return response.data;
  },

  getOrderById: async (id: number) => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  getAllOrders: async () => {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  updateOrderStatus: async (id: number, status: string) => {
    const response = await api.put<Order>(`/orders/${id}/status?status=${status}`, {});
    return response.data;
  }
};

export default orderService;
