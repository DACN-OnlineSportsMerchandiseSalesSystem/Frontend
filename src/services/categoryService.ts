import api from './api';

export interface Category {
  id: number;
  name: string;
  slug: string;
  status: string;
  rating: number;
  parentId?: number | null;
  parentName?: string;
}

const categoryService = {
  getAllCategories: async () => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  createCategory: async (categoryData: Partial<Category>) => {
    const response = await api.post<Category>('/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id: number, categoryData: Partial<Category>) => {
    const response = await api.put<Category>(`/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id: number) => {
    await api.delete(`/categories/${id}`);
  }
};

export default categoryService;
