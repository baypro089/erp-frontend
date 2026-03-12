import api from '@libs/src/services/api.service';
import type { ICommercialReport, SalesReportFilterDto } from '@libs/shared/types/commercial-report.type';

class SalesReportService {
  private readonly BASE_URL = '/sales-reports';

  /**
   * Lấy báo cáo doanh số & lợi nhuận
   */
  async getProfitReport(filter?: SalesReportFilterDto): Promise<ICommercialReport> {
    const params: Record<string, any> = {};

    if (filter?.periodType) params.periodType = filter.periodType;
    if (filter?.month) params.month = filter.month;
    if (filter?.quarter) params.quarter = filter.quarter;
    if (filter?.year) params.year = filter.year;

    const response = await api.get<any>(`${this.BASE_URL}/profit`, { params });
    return response.data.data;
  }

  /**
   * Xuất báo cáo doanh số & lợi nhuận ra file Excel
   */
  async exportToExcel(filter?: SalesReportFilterDto): Promise<Blob> {
    const params: Record<string, any> = {};

    if (filter?.periodType) params.periodType = filter.periodType;
    if (filter?.month) params.month = filter.month;
    if (filter?.quarter) params.quarter = filter.quarter;
    if (filter?.year) params.year = filter.year;

    const response = await api.get(`${this.BASE_URL}/export-excel`, {
      params,
      responseType: 'blob',
    });

    return response.data;
  }
}

export default new SalesReportService();
