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

  createProduct: async (productData: any) => {
    const response = await api.post<Product>('/products', productData);
    return response.data;
  },

  updateProduct: async (id: number, productData: any) => {
    const response = await api.put<Product>(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id: number) => {
    await api.delete(`/products/${id}`);
  }
};

export default productService;
