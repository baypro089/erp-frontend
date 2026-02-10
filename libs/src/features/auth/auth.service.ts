import api from '@libs/src/services/api.service';
import { UserResponse } from '@libs/shared/types/users.type';

type loginRequest = {
    username: string;
    password: string;
}

type loginResponse = {
    responseData: UserResponse;
    message: string;
}

const login = async (data: loginRequest): Promise<UserResponse> => {
  const response = await api.post('/auth/login', data);
  return response.data.user;
};

const logout = async () => {
    const response = await api.post('/auth/logout');
    return response.data.message;
}

const me = async (): Promise<{id: string, role: string}> => {
    const response = await api.get('/auth/me');
    return response.data;
}

const forgotPassword = async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
}

const resetPassword = async (email: string, otp: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
}

export const authService = { login, logout, me, forgotPassword, resetPassword };