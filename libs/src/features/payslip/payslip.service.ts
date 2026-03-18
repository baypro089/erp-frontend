import api from '@libs/src/services/api.service';
import type {
  PayslipResponse,
  PagedAndFilteredPayslip,
  PayrollGenerationResult,
} from '@libs/shared/types/payslips.type';

class PayslipService {
  private readonly BASE_URL = '/payslips';

  // Generate payroll for all employees in a month
  async generatePayroll(month: number, year: number): Promise<PayrollGenerationResult> {
    const response = await api.post<any>(`${this.BASE_URL}/generate-payroll`, {
      month,
      year,
    });
    return response.data.data;
  }

  // Get all payslips with pagination and filters
  async getPayslips(
    search?: string,
    month?: number,
    year?: number,
    page?: number,
    pageSize?: number
  ): Promise<PagedAndFilteredPayslip> {
    const params: any = {};
    if (search) params.search = search;
    if (month) params.month = month;
    if (year) params.year = year;
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;

    const response = await api.get<any>(this.BASE_URL, { params });
    return response.data.data;
  }

  // Get my payslips (for employee)
  async getMyPayslips(
    month?: number,
    year?: number,
    page?: number,
    pageSize?: number
  ): Promise<PagedAndFilteredPayslip> {
    const params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;

    const response = await api.get<any>(`${this.BASE_URL}/my-payslips`, { params });
    return response.data.data;
  }

  // Get yearly payslips (for employee)
  async getYearlyPayslips(
    year: number
  ): Promise<{ details: PayslipResponse[], totalSalary: number, totalBaseSalary: number }> {
    const response = await api.get<any>(`${this.BASE_URL}/my-payslips/yearly`, { 
      params: { year } 
    });
    return response.data.data;
  }

  // Mark payslip as paid
  async markPayslipAsPaid(id: string): Promise<PayslipResponse> {
    const response = await api.patch<any>(`${this.BASE_URL}/${id}/mark-paid`);
    return response.data.data;
  }

  //Get payslip by id
  async getPayslipById(id: string): Promise<PayslipResponse> {
    const response = await api.get<any>(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }
}

export default new PayslipService();
