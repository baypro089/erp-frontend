import api from '@libs/src/services/api.service';
import type {
  ProductResponse,
  ProductTableResponse,
  CreateProductDto,
  UpdateProductDto,
  PagedAndFilteredProduct,
} from '@libs/shared/types/product.type';
import type { AttachmentResponse } from '@libs/shared/types/attachment.type';

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
  async createProduct(data: CreateProductDto, thumbnail?: File): Promise<ProductResponse> {
    if (!thumbnail) {
      const response = await api.post<any>(this.BASE_URL, data);
      return response.data.data;
    }

    const formData = new FormData();
    
    // Append all fields to FormData
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof CreateProductDto];
      if (value !== undefined && value !== null) {
        if (key === 'specifications' && typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          // Explicitly handle boolean values
          formData.append(key, value ? 'true' : 'false');
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    // Append thumbnail file if provided
    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }
    
    const response = await api.post<any>(this.BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  // Update product
  async updateProduct(id: string, data: UpdateProductDto, thumbnail?: File): Promise<ProductResponse> {
    if (!thumbnail) {
      const response = await api.put<any>(`${this.BASE_URL}/${id}`, data);
      return response.data.data;
    }

    const formData = new FormData();
    
    // Append all fields to FormData
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof UpdateProductDto];
      if (value !== undefined && value !== null) {
        if (key === 'specifications' && typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          // Explicitly handle boolean values
          formData.append(key, value ? 'true' : 'false');
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    // Append thumbnail file if provided
    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }
    
    const response = await api.put<any>(`${this.BASE_URL}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

  // Get product thumbnail
  async getProductThumbnail(id: string): Promise<AttachmentResponse | null> {
    try {
      const response = await api.get<any>(`${this.BASE_URL}/${id}/thumbnail`);
      return response.data.data;
    } catch (error) {
      return null;
    }
  }
}

export default new ProductService();
