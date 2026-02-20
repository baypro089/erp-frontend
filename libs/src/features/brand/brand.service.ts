import api from '@libs/src/services/api.service';
import type {
  BrandResponse,
  CreateBrandDto,
  UpdateBrandDto,
  PagedAndFilteredBrand,
} from '@libs/shared/types/brand.type';

class BrandService {
  private readonly BASE_URL = '/brands';

  // Get brands with pagination and filters
  async getBrands(
    name?: string,
    page?: number,
    pageSize?: number
  ): Promise<PagedAndFilteredBrand> {
    const params: any = {};
    if (name) params.name = name;
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;

    const response = await api.get<any>(this.BASE_URL, { params });
    return response.data.data;
  }

  // Get brand by ID
  async getBrandById(id: string): Promise<BrandResponse> {
    const response = await api.get<any>(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }

  // Create new brand
  async createBrand(data: CreateBrandDto): Promise<BrandResponse> {
    const response = await api.post<any>(this.BASE_URL, data);
    return response.data.data;
  }

  // Update brand
  async updateBrand(id: string, data: UpdateBrandDto): Promise<BrandResponse> {
    const response = await api.put<any>(`${this.BASE_URL}/${id}`, data);
    return response.data.data;
  }

  // Delete brands
  async deleteBrands(ids: string[]): Promise<void> {
    await api.delete(this.BASE_URL, { data: { ids } });
  }
}

export default new BrandService();
