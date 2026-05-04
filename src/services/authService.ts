import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  roleName?: string;
  status?: string;
}

export interface RegisterResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  roleName: string;
}

/**
 * Đăng nhập - POST /api/auth/login
 * Lưu accessToken vào localStorage
 */
export async function loginAPI(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', data);
  const { accessToken, tokenType } = response.data;
  localStorage.setItem('accessToken', accessToken);
  return { accessToken, tokenType };
}

/**
 * Đăng ký thành viên - POST /api/auth/register
 * Tự động set status='ACTIVE', roleName='ROLE_USER' nếu không truyền
 */
export async function registerAPI(data: RegisterRequest): Promise<RegisterResponse> {
  const payload: RegisterRequest = {
    ...data,
    roleName: data.roleName || 'ROLE_USER',
    status: data.status || 'ACTIVE',
  };
  const response = await api.post<RegisterResponse>('/auth/register', payload);
  return response.data;
}

/**
 * Đăng xuất - xóa token khỏi localStorage
 */
export function logoutAPI(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userRole');
}
