import api from './api';

export interface Brand {
  id: number;
  name: string;
}

const brandService = {
  getAllBrands: async () => {
    const response = await api.get<Brand[]>('/brands');
    return response.data;
  },

  createBrand: async (brandData: Partial<Brand>) => {
    const response = await api.post<Brand>('/brands', brandData);
    return response.data;
  },

  updateBrand: async (id: number, brandData: Partial<Brand>) => {
    const response = await api.put<Brand>(`/brands/${id}`, brandData);
    return response.data;
  },

  deleteBrand: async (id: number) => {
    await api.delete(`/brands/${id}`);
  }
};

export default brandService;
