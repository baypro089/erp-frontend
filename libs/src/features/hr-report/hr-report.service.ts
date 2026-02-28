import api from '@libs/src/services/api.service';
import type { IManagerReport, ManagerReportFilterDto } from '@libs/shared/types/manager-report.type';

const hrReportService = {
  /**
   * Lấy báo cáo quản lý HR (Manager Report)
   * @param filter - Bộ lọc theo tháng/năm
   * @returns Báo cáo chi tiết về nhân sự và quỹ lương
   */
  async getManagerReport(filter?: ManagerReportFilterDto): Promise<IManagerReport> {
    const params = new URLSearchParams();
    
    if (filter?.month) {
      params.append('month', String(filter.month));
    }
    if (filter?.year) {
      params.append('year', String(filter.year));
    }

    const queryString = params.toString();
    const url = `/hr/reports/manager${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<{ data: IManagerReport }>(url);
    return response.data.data;
  },
};

export default hrReportService;
