import api from '@libs/src/services/api.service';
import type { IWarehouseReport, WarehouseReportFilterDto } from '@libs/shared/types/warehouse-report.type';

class WarehouseReportService {
  private readonly BASE_URL = '/warehouse/reports';

  /**
   * Get product statistics report by warehouse
   */
  async getProductStatistics(filter?: WarehouseReportFilterDto): Promise<IWarehouseReport> {
    const params: any = {};
    
    if (filter?.warehouseId) params.warehouseId = filter.warehouseId;
    if (filter?.month) params.month = filter.month;
    if (filter?.year) params.year = filter.year;

    const response = await api.get<any>(`${this.BASE_URL}/products`, { params });
    return response.data.data;
  }

  /**
   * Export warehouse report to Excel
   */
  async exportToExcel(filter?: WarehouseReportFilterDto): Promise<Blob> {
    const params: any = {};
    
    if (filter?.warehouseId) params.warehouseId = filter.warehouseId;
    if (filter?.month) params.month = filter.month;
    if (filter?.year) params.year = filter.year;

    const response = await api.get(`${this.BASE_URL}/products/export`, {
      params,
      responseType: 'blob',
    });
    
    return response.data;
  }
}

export default new WarehouseReportService();
