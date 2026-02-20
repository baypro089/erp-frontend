import api from '@libs/src/services/api.service';
import type { 
  ProductStockFilteredAndPaged, 
  ProductStockResponse 
} from '@libs/shared/types/product-stock.type';
import type { 
  StockHistoryFilteredAndPaged 
} from '@libs/shared/types/stock-history.type';
import type { StockAdjustmentDTO } from '@libs/shared/types/product-stock.type';

const PRODUCT_STOCKS_API = '/product-stocks';

class ProductStockService {
  /**
   * Lấy danh sách tồn kho theo kho
   */
  async getStocksByWarehouse(params: {
    warehouseId: string;
    search?: string;
    lowStock?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<ProductStockFilteredAndPaged> {
    const response = await api.get<any>(
      PRODUCT_STOCKS_API,
      { params }
    );
    return response.data.data;
  }

  /**
   * Lấy lịch sử biến động tồn kho của một sản phẩm trong kho
   */
  async getStockHistory(
    warehouseId: string,
    productId: string,
    page?: number,
    pageSize?: number
  ): Promise<StockHistoryFilteredAndPaged> {
    const response = await api.get<any>(
      `${PRODUCT_STOCKS_API}/history/${warehouseId}/${productId}`,
      { params: { page, pageSize } }
    );
    return response.data.data;
  }

  /**
   * Điều chỉnh tồn kho thủ công
   */
  async adjustStock(dto: StockAdjustmentDTO): Promise<ProductStockResponse> {
    const response = await api.post<any>(
      `${PRODUCT_STOCKS_API}/adjust`,
      dto
    );
    return response.data.data;
  }
}

export default new ProductStockService();
