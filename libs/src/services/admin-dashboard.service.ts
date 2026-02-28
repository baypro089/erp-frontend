import api from './api.service';
import type { IAdminDashboard, DashboardFilterDto } from '@libs/shared/types/statistics.type';

export const AdminDashboardService = {
  /**
   * Lấy dữ liệu dashboard tổng quan cho Admin
   */
  async getMasterDashboard(filter?: DashboardFilterDto): Promise<IAdminDashboard> {
    const params = new URLSearchParams();
    
    if (filter?.fromDate) {
      params.append('fromDate', filter.fromDate);
    }
    if (filter?.toDate) {
      params.append('toDate', filter.toDate);
    }

    const queryString = params.toString();
    const url = `/admin/dashboard${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<{ data: IAdminDashboard }>(url);
    return response.data.data;
  },
};
