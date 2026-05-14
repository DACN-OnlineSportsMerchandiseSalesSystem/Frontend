import api from './api';

export interface UserProfile {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status?: string;
  roleName?: string;
  level?: number;
  rank?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface AdminCreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  roleName: string;
  status: string;
}

/**
 * Xem danh sách tất cả người dùng - GET /api/users (ADMIN ONLY)
 */
export async function getAllUsersAPI(): Promise<UserProfile[]> {
  const response = await api.get<UserProfile[]>('/users');
  return response.data;
}

/**
 * Xem thông tin người dùng theo ID - GET /api/users/{id} (ADMIN ONLY)
 */
export async function getUserByIdAPI(id: number): Promise<UserProfile> {
  const response = await api.get<UserProfile>(`/users/${id}`);
  return response.data;
}

/**
 * Chỉnh sửa thông tin người dùng theo ID - PUT /api/users/{id} (ADMIN ONLY)
 */
export async function updateUserByIdAPI(id: number, data: Partial<UserProfile>): Promise<UserProfile> {
  const response = await api.put<UserProfile>(`/users/${id}`, data);
  return response.data;
}

/**
 * Xóa người dùng theo ID - DELETE /api/users/{id} (ADMIN ONLY)
 */
export async function deleteUserByIdAPI(id: number): Promise<void> {
  await api.delete(`/users/${id}`);
}

/**
 * Xem thông tin cá nhân (my profile) - GET /api/users/my-profile
 */
export async function getMyProfileAPI(): Promise<UserProfile> {
  const response = await api.get<UserProfile>('/users/my-profile');
  return response.data;
}

/**
 * Cập nhật thông tin cá nhân (my profile) - PUT /api/users/my-profile
 */
export async function updateMyProfileAPI(data: Partial<UserProfile>): Promise<UserProfile> {
  const response = await api.put<UserProfile>('/users/my-profile', data);
  return response.data;
}

/**
 * Đổi mật khẩu - PUT /api/users/change-password
 */
export async function changePasswordAPI(data: ChangePasswordRequest): Promise<void> {
  await api.put('/users/change-password', data);
}

/**
 * Tạo tài khoản mới (ADMIN) - POST /api/users
 */
export async function adminCreateUserAPI(data: AdminCreateUserRequest): Promise<UserProfile> {
  const response = await api.post<UserProfile>('/users', data);
  return response.data;
}
