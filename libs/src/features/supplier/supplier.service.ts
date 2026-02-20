import api from '@libs/src/services/api.service';
import type {
  SupplierResponse,
  CreateSupplierDTO,
  UpdateSupplierDTO,
  SupplierListResponse,
} from '@libs/shared/types/supplier.type';

class SupplierService {
  private readonly BASE_URL = '/suppliers';

  // Get suppliers with pagination and filters
  async getSuppliers(
    name?: string,
    contactPhone?: string,
    page?: number,
    pageSize?: number
  ): Promise<SupplierListResponse> {
    const params: any = {};
    if (name) params.name = name;
    if (contactPhone) params.contactPhone = contactPhone;
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;

    const response = await api.get<any>(this.BASE_URL, { params });
    return response.data.data;
  }

  // Get supplier by ID
  async getSupplierById(id: string): Promise<SupplierResponse> {
    const response = await api.get<any>(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }

  // Create new supplier
  async createSupplier(data: CreateSupplierDTO): Promise<SupplierResponse> {
    const response = await api.post<any>(this.BASE_URL, data);
    return response.data.data;
  }

  // Update supplier
  async updateSupplier(id: string, data: UpdateSupplierDTO): Promise<SupplierResponse> {
    const response = await api.put<any>(`${this.BASE_URL}/${id}`, data);
    return response.data.data;
  }

  // Delete suppliers
  async deleteSuppliers(ids: string[]): Promise<void> {
    await api.delete<any>(this.BASE_URL, { data: { ids } });
  }
}

export default new SupplierService();
