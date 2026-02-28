import api from './api.service';
import type { IHrDashboard, HrDashboardFilterDto } from '@libs/shared/types/hr-statistics.type';

export const HrDashboardService = {
  /**
   * Lấy dữ liệu dashboard HR
   */
  async getHrDashboard(filter?: HrDashboardFilterDto): Promise<IHrDashboard> {
    const params = new URLSearchParams();
    
    if (filter?.month) {
      params.append('month', filter.month);
    }

    const queryString = params.toString();
    const url = `/hr/dashboard${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<{ data: IHrDashboard }>(url);
    return response.data.data;
  },
};
