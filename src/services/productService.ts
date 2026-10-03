import api from './api';

export interface ProductImage {
  id: number;
  imageUrl: string;
  isThumbnail: boolean;
}

export interface ProductVariant {
  id: number;
  skuCode: string;
  price: number;
  stockQuantity: number;
  size: string;
  color: string;
}

export interface Product {
  id: number;
  name: string;
  productCode: string;
  description: string;
  status: string;
  categoryIds: number[];
  categoryNames: string[];
  brandName: string;
  images: ProductImage[];
  variants: ProductVariant[];
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  discount: number;
  searchTag?: string;

  // Hạng mục 2: Metadata mở rộng cho AI & Thể thao
  targetSport?: string;
  fitnessLevel?: string;
  genderTarget?: string;
  suitableFor?: string;
  benefits?: string;
}

const productService = {
  getAllProducts: async (categoryId?: number, brandId?: number) => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (brandId) params.append('brandId', brandId.toString());
    
    const response = await api.get<Product[]>(`/products?${params.toString()}`);
    return response.data;
  },

  getProductById: async (id: number) => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  getProductsByCategory: async (categoryId: number) => {
    const response = await api.get<Product[]>(`/products/category/${categoryId}`);
    return response.data;
  },

  searchProducts: async (keyword: string) => {
    const response = await api.get<Product[]>(`/products/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  },

  searchProductsAi: async (query: string) => {
    const response = await api.get<Product[]>(`/products/search-ai?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  getRecommendedProducts: async (limit = 10, sport?: string, level?: string, priceRange?: string) => {
    const params = new URLSearchParams();
    if (sport) params.append('sport', sport);
    if (level) params.append('level', level);
    if (priceRange) params.append('priceRange', priceRange);
    params.append('limit', limit.toString());

    const response = await api.get<Product[]>(`/products/recommendations?${params.toString()}`);
    return response.data;
  },

  getPersonalizedRecommendations: async (sport?: string, level?: string, priceRange?: string, limit = 8) => {
    const params = new URLSearchParams();
    if (sport) params.append('sport', sport);
    if (level) params.append('level', level);
    if (priceRange) params.append('priceRange', priceRange);
    params.append('limit', limit.toString());

    const response = await api.get<Product[]>(`/products/recommendations?${params.toString()}`);
    return response.data;
  },

  getTopSellingProducts: async (limit = 10) => {
    const response = await api.get<Product[]>(`/products/top-selling?limit=${limit}`);
    return response.data;
  },

  getBestSellers: async (limit = 4) => {
    const response = await api.get<Product[]>(`/products/top-selling?limit=${limit}`);
    return response.data;
  },

  getNewArrivals: async (limit = 4) => {
    const response = await api.get<Product[]>(`/products/new-arrivals?limit=${limit}`);
    return response.data;
  },

  getOnSale: async (limit = 4) => {
    const response = await api.get<Product[]>(`/products/on-sale?limit=${limit}`);
    return response.data;
  },

  createProduct: async (productData: any) => {
    const response = await api.post<Product>('/products', productData);
    return response.data;
  },

  updateProduct: async (id: number | string, productData: any) => {
    const response = await api.put<Product>(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id: number | string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};

export default productService;
