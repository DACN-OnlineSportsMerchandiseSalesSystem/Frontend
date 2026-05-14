import api from './api';

export interface OrderItem {
  id?: number;
  productName: string;
  variantInfo?: string;
  unitPrice?: number;
  priceAtPurchase?: number;
  quantity: number;
  imageUrl: string;
  size?: string;
  color?: string;
}

export interface Order {
  id: number;
  orderCode?: string;
  createAt: string;
  note: string;
  totalPrice: number;
  shippingFee: number;
  status: string;
  receiverName: string;
  phone: string;
  paymentMethod: string;
  orderItems: OrderItem[];
  billingAddress: any;
}

const orderService = {
  createOrder: async (orderData: any) => {
    const response = await api.post<Order>('/orders', orderData);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  getAllOrdersAdmin: async () => {
    const response = await api.get<Order[]>('/orders/all');
    return response.data;
  },

  getOrderById: async (id: number) => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id: number, status: string) => {
    const response = await api.put<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },
  
  deleteOrder: async (id: number) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  }
};

export default orderService;
