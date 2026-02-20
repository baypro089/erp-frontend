import api from '@libs/src/services/api.service';
import type {
  ProductResponse,
  ProductTableResponse,
  CreateProductDto,
  UpdateProductDto,
  PagedAndFilteredProduct,
} from '@libs/shared/types/product.type';

class ProductService {
  private readonly BASE_URL = '/products';

  // Get products with pagination and filters
  async getProducts(
    sku?: string,
    name?: string,
    brandId?: string,
    categoryId?: string,
    retailPriceMin?: number,
    retailPriceMax?: number,
    page?: number,
    pageSize?: number
  ): Promise<PagedAndFilteredProduct> {
    const params: any = {};
    if (sku) params.sku = sku;
    if (name) params.name = name;
    if (brandId) params.brandId = brandId;
    if (categoryId) params.categoryId = categoryId;
    if (retailPriceMin) params.retailPriceMin = retailPriceMin;
    if (retailPriceMax) params.retailPriceMax = retailPriceMax;
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;

    const response = await api.get<any>(this.BASE_URL, { params });
    return response.data.data;
  }

  // Get product by ID
  async getProductById(id: string): Promise<ProductResponse> {
    const response = await api.get<any>(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }

  // Create new product
  async createProduct(data: CreateProductDto): Promise<ProductResponse> {
    const response = await api.post<any>(this.BASE_URL, data);
    return response.data.data;
  }

  // Update product
  async updateProduct(id: string, data: UpdateProductDto): Promise<ProductResponse> {
    const response = await api.put<any>(`${this.BASE_URL}/${id}`, data);
    return response.data.data;
  }

  // Delete products
  async deleteProducts(ids: string[]): Promise<void> {
    await api.delete(this.BASE_URL, { data: { ids } });
  }

  // Check SKU availability (for realtime validation)
  async checkSkuAvailability(sku: string, excludeId?: string): Promise<boolean> {
    try {
      const params: any = { sku };
      if (excludeId) params.excludeId = excludeId;
      
      const response = await api.get<any>(`${this.BASE_URL}/check-sku`, { params });
      return response.data.data.available;
    } catch (error) {
      return false;
    }
  }
}

export default new ProductService();
