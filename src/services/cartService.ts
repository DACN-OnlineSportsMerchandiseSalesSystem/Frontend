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
}

export interface Cart {
  id: number;
  name: string;
  status: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
  items: CartItem[];
  itemCount?: number;
  totalQuantity?: number;
  totalPrice: number;
}

const cartService = {
  // Tương thích ngược: lấy giỏ hàng mặc định hiện tại
  getMyCart: async () => {
    const response = await api.get<Cart>('/carts/default');
    return response.data;
  },

  // Lấy danh sách các giỏ hàng hoạt động
  getCarts: async (status: string = 'ACTIVE') => {
    const response = await api.get<Cart[]>('/carts', {
      params: { status }
    });
    return response.data;
  },

  // Lấy giỏ hàng mặc định
  getDefaultCart: async () => {
    const response = await api.get<Cart>('/carts/default');
    return response.data;
  },

  // Lấy giỏ hàng theo ID
  getCartById: async (cartId: number) => {
    const response = await api.get<Cart>(`/carts/${cartId}`);
    return response.data;
  },

  // Tạo mới giỏ hàng
  createCart: async (name: string) => {
    const response = await api.post<Cart>('/carts', { name });
    return response.data;
  },

  // Cập nhật giỏ hàng (tên hoặc trạng thái mặc định)
  updateCart: async (cartId: number, data: { name?: string; isDefault?: boolean }) => {
    const response = await api.patch<Cart>(`/carts/${cartId}`, data);
    return response.data;
  },

  // Lưu trữ (xóa mềm) giỏ hàng
  archiveCart: async (cartId: number) => {
    await api.delete(`/carts/${cartId}`);
  },

  // Thêm sản phẩm vào giỏ hàng (có thể chọn giỏ hàng cụ thể, nếu không có sẽ tự động vào giỏ hàng mặc định)
  addToCart: async (productVariantId: number, quantity: number, cartId?: number) => {
    const url = cartId ? `/carts/${cartId}/items` : '/carts/items';
    const response = await api.post<Cart>(url, {
      productVariantId,
      quantity
    });
    return response.data;
  },

  // Xóa sản phẩm khỏi giỏ hàng
  removeCartItem: async (itemId: number, cartId?: number) => {
    const url = cartId ? `/carts/${cartId}/items/${itemId}` : `/carts/items/${itemId}`;
    const response = await api.delete<Cart>(url);
    return response.data;
  },

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  updateCartItem: async (itemId: number, quantity: number, cartId?: number) => {
    const url = cartId ? `/carts/${cartId}/items/${itemId}` : `/carts/items/${itemId}`;
    const response = await api.put<Cart>(url, null, {
      params: { quantity }
    });
    return response.data;
  },

  // Xóa sạch giỏ hàng
  clearCart: async (cartId?: number) => {
    const url = cartId ? `/carts/${cartId}/items` : '/carts';
    await api.delete(url);
  }
};

export default cartService;
