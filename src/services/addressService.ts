import api from './api';

export interface AddressData {
  id?: number;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
}

/**
 * Xem danh sách địa chỉ của tôi - GET /api/addresses
 */
export async function getMyAddressesAPI(): Promise<AddressData[]> {
  const response = await api.get<AddressData[]>('/addresses');
  return response.data;
}

/**
 * Thêm địa chỉ mới - POST /api/addresses
 */
export async function addAddressAPI(data: Omit<AddressData, 'id'>): Promise<AddressData> {
  const response = await api.post<AddressData>('/addresses', data);
  return response.data;
}

/**
 * Đặt địa chỉ làm mặc định - PUT /api/addresses/{id}/default
 */
export async function setDefaultAddressAPI(id: number): Promise<AddressData> {
  const response = await api.put<AddressData>(`/addresses/${id}/default`);
  return response.data;
}

/**
 * Chỉnh sửa thông tin địa chỉ - PUT /api/addresses/{id}
 */
export async function updateAddressAPI(id: number, data: Partial<AddressData>): Promise<AddressData> {
  const response = await api.put<AddressData>(`/addresses/${id}`, data);
  return response.data;
}

/**
 * Xóa địa chỉ - DELETE /api/addresses/{id}
 */
export async function deleteAddressAPI(id: number): Promise<void> {
  await api.delete(`/addresses/${id}`);
}
