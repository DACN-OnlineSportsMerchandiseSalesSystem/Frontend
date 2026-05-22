import api from './api';

export interface Review {
  id: number;
  title: string;
  comment: string;
  rating: number;
  adminReply: string;
  createdAt: string;
  repliedAt: string;
  userEmail?: string;
  userName?: string;
}

export interface ReviewRequest {
  title: string;
  comment: string;
  rating: number;
}

const reviewService = {
  getReviewsByProduct: async (productId: number) => {
    const response = await api.get<Review[]>(`/products/${productId}/reviews`);
    return response.data;
  },

  createReview: async (productId: number, data: ReviewRequest) => {
    const response = await api.post<Review>(`/products/${productId}/reviews`, data);
    return response.data;
  },

  getAllReviews: async () => {
    const response = await api.get<Review[]>('/reviews');
    return response.data;
  },

  getLatest5StarReviews: async () => {
    const response = await api.get<Review[]>('/reviews/latest-5-star');
    return response.data;
  },

  deleteReview: async (id: number) => {
    await api.delete(`/reviews/${id}`);
  },

  replyReview: async (id: number, adminReply: string) => {
    const response = await api.put<Review>(`/reviews/${id}/reply`, { adminReply });
    return response.data;
  }
};

export default reviewService;
