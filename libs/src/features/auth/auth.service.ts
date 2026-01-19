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

const me = async (): Promise<UserResponse> => {
    const response = await api.get('/auth/me');
    return response.data;
}

export const authService = { login, logout, me   };