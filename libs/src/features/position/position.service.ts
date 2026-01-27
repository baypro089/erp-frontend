import api from '@libs/src/services/api.service';
import type {
  PositionResponse,
  CreatePositionDTO,
  UpdatePositionDTO,
  PagedAndFilteredPosition,
} from '@libs/shared/types/positions.type';

class PositionService {
  private readonly BASE_URL = '/positions';

  // Get all positions
  async getPositions(name?: string): Promise<PositionResponse[]> {
    const params: any = {};
    if (name) params.name = name;
    
    const response = await api.get<any>(this.BASE_URL, { params });
    return response.data.data;
  }

  // Get positions with pagination and filters
  async getPositionsWithOptional(
    name?: string,
    minSalary?: number,
    maxSalary?: number,
    page?: number,
    pageSize?: number
  ): Promise<PagedAndFilteredPosition> {
    const params: any = {};
    if (name) params.name = name;
    if (minSalary) params.minSalary = minSalary;
    if (maxSalary) params.maxSalary = maxSalary;
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;

    const response = await api.get<any>(`${this.BASE_URL}/optional`, {
      params,
    });
    return response.data.data;
  }

  // Get position by ID
  async getPositionById(id: string): Promise<PositionResponse> {
    const response = await api.get<any>(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }

  // Create new position
  async createPosition(data: CreatePositionDTO): Promise<PositionResponse> {
    const response = await api.post<any>(this.BASE_URL, data);
    return response.data.data;
  }

  // Update position
  async updatePosition(id: string, data: UpdatePositionDTO): Promise<PositionResponse> {
    const response = await api.put<any>(`${this.BASE_URL}/${id}`, data);
    return response.data.data;
  }

  // Delete positions
  async deletePositions(ids: string[]): Promise<void> {
    await api.delete(`${this.BASE_URL}`, { data: ids });    
  }
}

export default new PositionService();
