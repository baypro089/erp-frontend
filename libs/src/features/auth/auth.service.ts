import api from '@libs/src/services/api.service';

type loginRequest = {
    username: string;
    password: string;
}

type AuthUser = {
    id: string;
    role: string;
}

const login = async (data: loginRequest): Promise<void> => {
    await api.post('/auth/login', data);
};

const logout = async () => {
    const response = await api.post('/auth/logout');
    return response.data.message;
}

const me = async (): Promise<AuthUser> => {
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