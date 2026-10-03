import api from "./api";
import { Product } from "../app/data/products";

export const wishlistService = {
  getWishlist: async () => {
    const response = await api.get<Product[]>("/wishlist");
    return response.data;
  },
  addToWishlist: async (productId: number) => {
    await api.post(`/wishlist/${productId}`);
  },
  removeFromWishlist: async (productId: number) => {
    await api.delete(`/wishlist/${productId}`);
  },
  checkIsInWishlist: async (productId: number) => {
    const response = await api.get<boolean>(`/wishlist/${productId}/check`);
    return response.data;
  }
};

export default wishlistService;
