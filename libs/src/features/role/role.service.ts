import api from '@libs/src/services/api.service';
import type { RoleResponse, CreateRoleDTO, UpdateRoleDTO } from '@libs/shared/types/roles.type';
import type { PermissionResponse } from '@libs/shared/types/permissions.type';

export const roleService = {
  // Lấy danh sách roles với filter
  async getRoles(roleCode?: string, roleName?: string): Promise<RoleResponse[]> {
    const params = new URLSearchParams();
    if (roleCode) params.append('roleCode', roleCode);
    if (roleName) params.append('roleName', roleName);
    
    const response = await api.get(`/roles?${params.toString()}`);
    return response.data.data;
  },

  // Lấy role theo code
  async getRoleByCode(code: string): Promise<RoleResponse> {
    const response = await api.get(`/roles/${code}`);
    return response.data.data;
  },

  // Tạo role mới
  async createRole(data: CreateRoleDTO): Promise<RoleResponse> {
    const response = await api.post('/roles', data);
    return response.data.data;
  },

  // Cập nhật role
  async updateRole(code: string, data: UpdateRoleDTO): Promise<RoleResponse> {
    const response = await api.put(`/roles/${code}`, data);
    return response.data.data;
  },

  // Xóa nhiều roles
  async deleteRoles(codes: string[]): Promise<void> {
    await api.delete('/roles/delete', { data: codes });
  },

  // Lấy tất cả permissions
  async getAllPermissions(): Promise<PermissionResponse[]> {
    const response = await api.get('/roles/permissions/all');
    return response.data.data;
  },
};
