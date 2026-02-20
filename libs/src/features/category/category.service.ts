import api from '@libs/src/services/api.service';
import type {
  CategoryResponse,
  CreateCategoryDto,
  UpdateCategoryDto,
  PagedAndFilteredCategory,
} from '@libs/shared/types/category.type';

class CategoryService {
  private readonly BASE_URL = '/categories';

  // Get categories with pagination and filters
  async getCategories(
    name?: string,
    page?: number,
    pageSize?: number
  ): Promise<PagedAndFilteredCategory> {
    const params: any = {};
    if (name) params.name = name;
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;

    const response = await api.get<any>(this.BASE_URL, { params });
    return response.data.data;
  }

  // Get category by ID
  async getCategoryById(id: string): Promise<CategoryResponse> {
    const response = await api.get<any>(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }

  // Create new category
  async createCategory(data: CreateCategoryDto): Promise<CategoryResponse> {
    const response = await api.post<any>(this.BASE_URL, data);
    return response.data.data;
  }

  // Update category
  async updateCategory(id: string, data: UpdateCategoryDto): Promise<CategoryResponse> {
    const response = await api.put<any>(`${this.BASE_URL}/${id}`, data);
    return response.data.data;
  }

  // Delete categories
  async deleteCategories(ids: string[]): Promise<void> {
    await api.delete(this.BASE_URL, { data: { ids } });
  }
}

export default new CategoryService();
