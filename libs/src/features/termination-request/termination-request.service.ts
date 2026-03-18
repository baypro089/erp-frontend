import api from '@libs/src/services/api.service';
import type {
  CreateTerminationRequestDto,
  RestoreTerminationRequestDto,
  TerminationApproveResponse,
  TerminationRequestListResponse,
  TerminationRequestResponse,
} from '@libs/shared/types/termination-request.type';

class TerminationRequestService {
  private readonly BASE_URL = '/termination-requests';

  async createTerminationRequest(
    data: CreateTerminationRequestDto,
  ): Promise<TerminationRequestResponse> {
    const response = await api.post<any>(this.BASE_URL, data);
    return response.data.data;
  }

  async getTerminationRequests(
    status?: string,
    employeeName?: string,
    page?: number,
    pageSize?: number,
  ): Promise<TerminationRequestListResponse> {
    const params: Record<string, string | number> = {};

    if (status) params.status = status;
    if (employeeName) params.employeeName = employeeName;
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;

    const response = await api.get<any>(this.BASE_URL, { params });
    return response.data.data;
  }

  async getTerminationRequestById(id: string): Promise<TerminationApproveResponse> {
    const response = await api.get<any>(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }

  async approveTerminationRequest(id: string): Promise<TerminationApproveResponse> {
    const response = await api.put<any>(`${this.BASE_URL}/${id}/approve`);
    return response.data.data;
  }

  async rejectTerminationRequest(id: string): Promise<TerminationRequestResponse> {
    const response = await api.put<any>(`${this.BASE_URL}/${id}/reject`);
    return response.data.data;
  }

  async updateReassignStatus(
    id: string,
    isReassigned: boolean,
  ): Promise<TerminationRequestResponse> {
    const response = await api.put<any>(`${this.BASE_URL}/${id}/reassign-status`, {
      isReassigned,
    });
    return response.data.data;
  }

  async restoreTerminationRequest(
    id: string,
    data: RestoreTerminationRequestDto,
  ): Promise<TerminationRequestResponse> {
    const response = await api.put<any>(`${this.BASE_URL}/${id}/restore`, data);
    return response.data.data;
  }

  async getTerminationRequestsByEmployee(employeeId: string): Promise<TerminationRequestResponse[]> {
    const response = await api.get<any>(`${this.BASE_URL}/employee/${employeeId}`);
    return response.data.data;
  }
}

const terminationRequestService = new TerminationRequestService();
export default terminationRequestService;
