import api from '@libs/src/services/api.service';
import type {
  EmployeeResponse,
  EmployeeTableResponse,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  PagedAndFilteredEmployee,
} from '@libs/shared/types/employees.type';
import type { AttachmentResponse } from '@libs/shared/types/attachment.type';

class EmployeeService {
  private readonly BASE_URL = '/employees';

  // Get all employees
  async getEmployees(permissionPortal?: string): Promise<EmployeeResponse[]> {
    const response = await api.get<any>(this.BASE_URL + (permissionPortal ? `?permissionPortal=${permissionPortal}` : ``));
    return response.data.data;
  }

  // Get employees with pagination and filters
  async getEmployeesWithOptional(
    employeeCode?: string,
    fullName?: string,
    departmentId?: string,
    positionId?: string,
    startDateFrom?: string,
    startDateTo?: string,
    level?: string,
    status?: string,
    page?: number,
    pageSize?: number
  ): Promise<PagedAndFilteredEmployee> {
    const params: any = {};
    if (employeeCode) params.employeeCode = employeeCode;
    if (fullName) params.fullName = fullName;
    if (departmentId) params.departmentId = departmentId;
    if (positionId) params.positionId = positionId;
    if (startDateFrom) params.startDateFrom = startDateFrom;
    if (startDateTo) params.startDateTo = startDateTo;
    if (level) params.level = level;
    if (status) params.status = status;
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;

    const response = await api.get<any>(`${this.BASE_URL}/optional`, { params });
    return response.data.data;
  }

  // Get deleted employees
  async getDeletedEmployees(
    employeeCode?: string,
    fullName?: string,
    departmentId?: string,
    positionId?: string,
    startDateFrom?: string,
    startDateTo?: string,
    level?: string,
    status?: string,
    page?: number,
    pageSize?: number
  ): Promise<PagedAndFilteredEmployee> {
    const params: any = {};
    if (employeeCode) params.employeeCode = employeeCode;
    if (fullName) params.fullName = fullName;
    if (departmentId) params.departmentId = departmentId;
    if (positionId) params.positionId = positionId;
    if (startDateFrom) params.startDateFrom = startDateFrom;
    if (startDateTo) params.startDateTo = startDateTo;
    if (level) params.level = level;
    if (status) params.status = status;
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;

    const response = await api.get<any>(`${this.BASE_URL}/optional/deleted`, { params });
    return response.data.data;
  }

  // Get employee by ID
  async getEmployeeById(id: string): Promise<EmployeeResponse> {
    const response = await api.get<any>(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }

  // Create new employee
  async createEmployee(data: CreateEmployeeDto): Promise<EmployeeResponse> {
    const response = await api.post<any>(this.BASE_URL, data);
    return response.data.data;
  }

  // Update employee
  async updateEmployee(id: string, data: UpdateEmployeeDto): Promise<EmployeeResponse> {
    const response = await api.put<any>(`${this.BASE_URL}/${id}`, data);
    return response.data.data;
  }

  // Delete employees
  async deleteEmployees(ids: string[]): Promise<void> {
    await api.delete(`${this.BASE_URL}/delete`, { data: ids });
  }

  // Upload or update employee photo
  async updateEmployeePhoto(id: string, photo: File): Promise<EmployeeResponse> {
    const formData = new FormData();
    formData.append('photo', photo);
    
    const response = await api.put<any>(`${this.BASE_URL}/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  // Upload or update employee CV
  async updateEmployeeCV(id: string, cv: File): Promise<EmployeeResponse> {
    const formData = new FormData();
    formData.append('cv', cv);
    
    const response = await api.put<any>(`${this.BASE_URL}/${id}/cv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  // Get employee photo
  async getEmployeePhoto(id: string): Promise<AttachmentResponse | null> {
    try {
      const response = await api.get<any>(`${this.BASE_URL}/${id}/photo`);
      return response.data.data;
    } catch (error) {
      return null;
    }
  }

  // Get employee CV
  async getEmployeeCV(id: string): Promise<AttachmentResponse | null> {
    try {
      const response = await api.get<any>(`${this.BASE_URL}/${id}/cv`);
      return response.data.data;
    } catch (error) {
      return null;
    }
  }
}

export default new EmployeeService();
