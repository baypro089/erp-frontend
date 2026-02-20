import api from '@libs/src/services/api.service';
import type {
  ProductSerialResponse,
  ProductSerialListResponse,
} from '@libs/shared/types/product-serial.type';

class ProductSerialService {
  private readonly BASE_URL = '/product-serials';

  /**
   * Lấy danh sách serial theo sản phẩm và kho
   */
  async getSerialsByProduct(
    productId: string,
    warehouseId: string,
    page?: number,
    pageSize?: number
  ): Promise<ProductSerialListResponse> {
    const params: any = { productId, warehouseId };
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;

    const response = await api.get<any>(this.BASE_URL, { params });
    return response.data.data;
  }

  /**
   * Lấy thông tin serial theo số serial/IMEI
   */
  async getSerialByNumber(serialNumber: string): Promise<ProductSerialResponse> {
    const response = await api.get<any>(`${this.BASE_URL}/${serialNumber}`);
    return response.data.data;
  }
}

export default new ProductSerialService();
