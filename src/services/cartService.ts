import api from './api';

export interface CartItem {
  id: number;
  productVariantId: number;
  productName: string;
  variantInfo: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  totalPrice: number;
}

const cartService = {
  getMyCart: async () => {
    const response = await api.get<Cart>('/carts');
    return response.data;
  },

  addToCart: async (productVariantId: number, quantity: number) => {
    const response = await api.post<Cart>('/carts/items', {
      productVariantId,
      quantity
    });
    return response.data;
  },

  removeCartItem: async (itemId: number) => {
    const response = await api.delete<Cart>(`/carts/items/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    await api.delete('/carts');
  }
};

export default cartService;
