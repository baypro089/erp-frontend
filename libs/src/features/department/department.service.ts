import api from '@libs/src/services/api.service';
import type {
  DepartmentResponse,
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  PagedAndFilteredDepartment,
} from '@libs/shared/types/departments.type';

class DepartmentService {
  private readonly BASE_URL = '/departments';

  // Get all departments
  async getDepartments(name?: string): Promise<DepartmentResponse[]> {
    const params: any = {};
    if (name) params.name = name;
    
    const response = await api.get<any>(this.BASE_URL, { params });
    return response.data.data;
  }

  // Get departments with pagination and filters
  async getDepartmentsWithOptional(
    name?: string,
    page?: number,
    pageSize?: number
  ): Promise<PagedAndFilteredDepartment> {
    const params: any = {};
    if (name) params.name = name;
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;

    const response = await api.get<any>(`${this.BASE_URL}/optional`, {
      params,
    });
    return response.data.data;
  }

  // Get department by ID
  async getDepartmentById(id: string): Promise<DepartmentResponse> {
    const response = await api.get<any>(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }

  // Create new department
  async createDepartment(data: CreateDepartmentDTO): Promise<DepartmentResponse> {
    const response = await api.post<any>(this.BASE_URL, data);
    return response.data.data;
  }

  // Update department
  async updateDepartment(id: string, data: UpdateDepartmentDTO): Promise<DepartmentResponse> {
    const response = await api.put<any>(`${this.BASE_URL}/${id}`, data);
    return response.data.data;
  }

  // Delete departments
  async deleteDepartments(ids: string[]): Promise<void> {
    await api.delete(`${this.BASE_URL}/delete`, { data: ids });
  }
}

export default new DepartmentService();
