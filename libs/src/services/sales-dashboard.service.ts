import api from './api.service';
import type { ISalesDashboard, SalesDashboardFilterDto } from '@libs/shared/types/sales-statistics.type';

export const SalesDashboardService = {
  /**
   * Lấy dữ liệu dashboard Sales
   */
  async getSalesDashboard(filter?: SalesDashboardFilterDto): Promise<ISalesDashboard> {
    const params = new URLSearchParams();
    
    if (filter?.month) {
      params.append('month', filter.month);
    }
    if (filter?.year) {
      params.append('year', filter.year);
    }

    const queryString = params.toString();
    const url = `/sales/dashboard${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<{ data: ISalesDashboard }>(url);
    return response.data.data;
  },
};
