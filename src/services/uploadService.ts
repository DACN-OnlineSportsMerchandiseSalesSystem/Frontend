import api from './api';

const uploadService = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ url: string }>('/upload', formData);
    return response.data;
  },
};

export default uploadService;
