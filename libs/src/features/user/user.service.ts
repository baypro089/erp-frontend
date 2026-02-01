import apiService from '@libs/src/services/api.service';
import type { UserResponse, UserFilterAndPaged, CreateUserDto, UpdateUserDto } from '@libs/shared/types/users.type';

const userService = {
  async getUsers(): Promise<UserResponse[]> {
    const response = await apiService.get<UserResponse[]>('/users');
    return response.data;
  },

  async getUsersWithOptional(
    userId?: string,
    username?: string,
    email?: string,
    roleId?: string,
    employeeName?: string,
    createDateFrom?: string,
    createDateTo?: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<UserFilterAndPaged> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (username) params.append('username', username);
    if (email) params.append('email', email);
    if (roleId) params.append('roleId', roleId);
    if (employeeName) params.append('employeeName', employeeName);
    if (createDateFrom) params.append('createDateFrom', createDateFrom);
    if (createDateTo) params.append('createDateTo', createDateTo);
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());

    const response = await apiService.get<{ data: UserFilterAndPaged }>(`/users/optional?${params.toString()}`);
    console.log('API Response:', response.data);
    return response.data.data;
  },

  async getUserById(id: string): Promise<UserResponse> {
    const response = await apiService.get<{ data: UserResponse }>(`/users/${id}`);
    return response.data.data; // Unwrap nested data
  },

  async createUser(data: CreateUserDto): Promise<UserResponse> {
    const response = await apiService.post<UserResponse>('/users', data);
    return response.data;
  },

  async updateUser(id: string, data: UpdateUserDto): Promise<UserResponse> {
    const response = await apiService.put<UserResponse>(`/users/${id}`, data);
    return response.data;
  },

  async banUser(id: string): Promise<void> {
    await apiService.post(`/users/${id}/ban`);
  },
};

export default userService;
