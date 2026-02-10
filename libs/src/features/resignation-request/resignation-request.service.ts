import api from '@libs/src/services/api.service';
import type {
  ResighnationRequestResponse,
  CreateResignationRequest,
  ResighnationRequestListResponse,
} from '@libs/shared/types/resignation-request.type';

class ResignationRequestService {
  private readonly BASE_URL = '/resignation-requests';

  // Create a new resignation request
  async createResignationRequest(data: CreateResignationRequest): Promise<ResighnationRequestResponse> {
    const response = await api.post<any>(this.BASE_URL, data);
    return response.data.data;
  }

  // Get all resignation requests with filters and pagination
  async getResignationRequests(
    status?: string,
    employeeName?: string,
    page?: number,
    pageSize?: number,
  ): Promise<ResighnationRequestListResponse> {
    const params: any = {};
    if (status) params.status = status;
    if (employeeName) params.employeeName = employeeName;
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;

    const response = await api.get<any>(this.BASE_URL, { params });
    return response.data.data;
  }

  // Get resignation request by ID
  async getResignationRequestById(id: string): Promise<ResighnationRequestResponse> {
    const response = await api.get<any>(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }

  // Get my resignation requests
  async getMyResignationRequests(employeeId: string): Promise<ResighnationRequestResponse[]> {
    const response = await api.get<any>(`${this.BASE_URL}/employee/${employeeId}`);
    return response.data.data;
  }

  // Approve resignation request
  async approveResignationRequest(
    id: string,
    approvedLastDay: Date,
    hrNote?: string
  ): Promise<ResighnationRequestResponse> {
    const response = await api.put<any>(`${this.BASE_URL}/${id}/approve`, {
      id,
      approvedLastDay: approvedLastDay.toISOString(),
      hrNote,
    });
    return response.data.data;
  }

  // Reject resignation request
  async rejectResignationRequest(
    id: string,
    hrNote: string
  ): Promise<ResighnationRequestResponse> {
    const response = await api.put<any>(`${this.BASE_URL}/${id}/reject`, {
      hrNote,
    });
    return response.data.data;
  }
}

const resignationRequestService = new ResignationRequestService();
export default resignationRequestService;
