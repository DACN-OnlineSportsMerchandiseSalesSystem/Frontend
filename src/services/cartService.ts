import api from './api';

export interface CartItem {
  id: number;
  productVariantId: number;
  productId: number;
  productName: string;
  variantInfo: string;
  unitPrice: number;
  originalPrice?: number;
  discount?: number;
  quantity: number;
  imageUrl: string;
  comboId?: number;
  isCombo?: boolean;
}

export type CartItemDTO = CartItem;

export interface AddCartRequest {
  productVariantId: number;
  quantity: number;
  childVariantIds?: number[];
  comboId?: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  totalPrice: number;
  name?: string;
  isDefault?: boolean;
}

const cartService = {
  getMyCart: async () => {
    const response = await api.get<Cart>('/carts/default');
    return response.data;
  },

  addToCart: async (productVariantIdOrReq: number | AddCartRequest, quantity?: number, childVariantIds?: number[], comboId?: number) => {
    const payload: AddCartRequest = typeof productVariantIdOrReq === 'object'
      ? productVariantIdOrReq
      : {
          productVariantId: productVariantIdOrReq,
          quantity: quantity ?? 1,
          childVariantIds,
          comboId
        };
    const response = await api.post<Cart>('/carts/items', payload);
    return response.data;
  },

  removeCartItem: async (itemId: number) => {
    const response = await api.delete<Cart>(`/carts/items/${itemId}`);
    return response.data;
  },

  updateCartItem: async (itemId: number, quantity: number) => {
    const response = await api.put<Cart>(`/carts/items/${itemId}`, { quantity });
    return response.data;
  },

  clearCart: async () => {
    await api.delete('/carts');
  },

  getAllCarts: async () => {
    const response = await api.get<Cart[]>('/carts');
    return response.data;
  },

  createCart: async (name: string) => {
    const response = await api.post<Cart>('/carts', { name });
    return response.data;
  },

  updateCart: async (cartId: number, name?: string, isDefault?: boolean) => {
    const response = await api.patch<Cart>(`/carts/${cartId}`, { name, isDefault });
    return response.data;
  },

  archiveCart: async (cartId: number) => {
    await api.delete(`/carts/${cartId}`);
  },

  addToCartToSpecific: async (cartId: number, productVariantIdOrReq: number | AddCartRequest, quantity?: number, childVariantIds?: number[], comboId?: number) => {
    const payload: AddCartRequest = typeof productVariantIdOrReq === 'object'
      ? productVariantIdOrReq
      : {
          productVariantId: productVariantIdOrReq,
          quantity: quantity ?? 1,
          childVariantIds,
          comboId
        };
    const response = await api.post<Cart>(`/carts/${cartId}/items`, payload);
    return response.data;
  }
};

export default cartService;
