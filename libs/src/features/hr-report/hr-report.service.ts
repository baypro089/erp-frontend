import api from '@libs/src/services/api.service';
import type { IManagerReport, ManagerReportFilterDto } from '@libs/shared/types/manager-report.type';

const hrReportService = {
  /**
   * Lấy báo cáo quản lý HR (Manager Report)
   * @param filter - Bộ lọc theo tháng/năm
   * @returns Báo cáo chi tiết về nhân sự và quỹ lương
   */
  async getManagerReport(filter?: ManagerReportFilterDto): Promise<IManagerReport> {
    const params: Record<string, any> = {};
    
    if (filter?.month) {
      params.month = Number(filter.month);
    }
    if (filter?.year) {
      params.year = Number(filter.year);
    }

    const url = `/hr/reports/manager`;
    
    const response = await api.get<{ data: IManagerReport }>(url, { params });
    return response.data.data;
  },
};

export default hrReportService;
