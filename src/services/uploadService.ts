import api from './api';

const uploadService = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ url: string }>('/upload', formData);
    return response.data;
  },

  uploadForumImage: async (file: File): Promise<{ url: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post<{ url: string }>('/upload-forum-image', formData);
      if (response.data && response.data.url) {
        return response.data;
      }
      throw new Error('Không nhận được URL từ máy chủ Cloudinary');
    } catch (err) {
      console.warn('Backend Cloudinary upload failed, using local FileReader fallback:', err);
      // Fallback: Convert to Base64 data URL so user still has immediate preview and image persistence
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve({ url: reader.result });
          } else {
            reject(new Error('Lỗi chuyển đổi ảnh'));
          }
        };
        reader.onerror = () => reject(new Error('Lỗi đọc file ảnh'));
        reader.readAsDataURL(file);
      });
    }
  },
};

export default uploadService;
