import api from './api';

export interface ReturnItemDTO {
  id?: number;
  orderItemId: number;
  quantity: number;
  imageProof: string;
}

export interface ReturnRequestDTO {
  id?: number;
  orderId: number;
  userId?: number;
  status?: string;
  refundAmount?: number;
  reason: string;
  createdAt?: string;
  items: ReturnItemDTO[];
}

export interface CreateReturnRequestDTO {
  orderId: number;
  reason: string;
  items: {
    orderItemId: number;
    quantity: number;
    imageProof: string;
  }[];
}

const returnService = {
  getAllReturns: async () => {
    const response = await api.get<ReturnRequestDTO[]>('/returns');
    return response.data;
  },

  getMyReturns: async () => {
    const response = await api.get<ReturnRequestDTO[]>('/returns/my-returns');
    return response.data;
  },

  createReturn: async (data: CreateReturnRequestDTO) => {
    const response = await api.post<ReturnRequestDTO>('/returns', data);
    return response.data;
  },

  processReturn: async (id: number, status: string, refundAmount?: number) => {
    const response = await api.put<ReturnRequestDTO>(`/returns/${id}/process`, { status, refundAmount });
    return response.data;
  }
};

export default returnService;
