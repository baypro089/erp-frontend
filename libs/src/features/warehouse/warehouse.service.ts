import api from '@libs/src/services/api.service';
import type {
  WarehouseResponse,
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from '@libs/shared/types/warehouse.type';

class WarehouseService {
  private readonly BASE_URL = '/warehouses';

  // Get all warehouses
  async getWarehouses(): Promise<WarehouseResponse[]> {
    const response = await api.get<any>(this.BASE_URL);
    return response.data.data;
  }

  // Get warehouse by ID
  async getWarehouseById(id: string): Promise<WarehouseResponse> {
    const response = await api.get<any>(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }

  // Create new warehouse
  async createWarehouse(data: CreateWarehouseDto): Promise<WarehouseResponse> {
    const response = await api.post<any>(this.BASE_URL, data);
    return response.data.data;
  }

  // Update warehouse
  async updateWarehouse(id: string, data: UpdateWarehouseDto): Promise<WarehouseResponse> {
    const response = await api.put<any>(`${this.BASE_URL}/${id}`, data);
    return response.data.data;
  }

  // Delete warehouses (soft delete by setting inactive)
  async deleteWarehouses(ids: string[]): Promise<WarehouseResponse[]> {
    const response = await api.put<any>(`${this.BASE_URL}/remove`, ids);
    return response.data.data;
  }
}

export default new WarehouseService();
