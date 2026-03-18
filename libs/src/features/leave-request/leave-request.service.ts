import api from '@libs/src/services/api.service';
import type {
  LeaveRequestResponse,
  LeaveRequestCreateDto,
  CreateLeaveRequestPayload,
  PagedAndFilteredLeaveRequest,
  CalculateWorkingDaysDto,
} from '@libs/shared/types/leave-requests.type';
import { LeaveRequestStatus } from '@libs/shared/enums/leave-request-status.enum';

class LeaveRequestService {
  private readonly BASE_URL = '/leave-requests';

  // Create a new leave request
  async createLeaveRequest(payload: CreateLeaveRequestPayload): Promise<LeaveRequestResponse> {
    const { data, documentFile } = payload;

    if (!documentFile) {
      const response = await api.post<any>(this.BASE_URL, {
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate?.toISOString(),
      });
      return response.data.data;
    }

    const formData = new FormData();

    formData.append('employeeId', data.employeeId);
    formData.append('startDate', data.startDate.toISOString());
    if (data.endDate) {
      formData.append('endDate', data.endDate.toISOString());
    }
    formData.append('type', data.type);
    formData.append('reason', data.reason);
    if (data.documentUrl) {
      formData.append('documentUrl', data.documentUrl);
    }
    if (documentFile) {
      formData.append('document', documentFile);
    }

    const response = await api.post<any>(this.BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  // Get current user's leave requests with filters and pagination
  async getMyLeaveRequests(
    status?: LeaveRequestStatus,
    startDateFrom?: Date,
    startDateTo?: Date,
    page?: number,
    pageSize?: number,
  ): Promise<PagedAndFilteredLeaveRequest> {
    const params: any = {};
    if (status) params.status = status;
    if (startDateFrom) params.startDateFrom = startDateFrom.toISOString();
    if (startDateTo) params.startDateTo = startDateTo.toISOString();
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;

    const response = await api.get<any>(`${this.BASE_URL}/my`, { params });
    return response.data.data;
  }

  // Get all leave requests with filters and pagination (for HR)
  async getLeaveRequests(
    status?: LeaveRequestStatus,
    startDateFrom?: Date,
    startDateTo?: Date,
    page?: number,
    pageSize?: number,
  ): Promise<PagedAndFilteredLeaveRequest> {
    const params: any = {};
    if (status) params.status = status;
    if (startDateFrom) params.startDateFrom = startDateFrom.toISOString();
    if (startDateTo) params.startDateTo = startDateTo.toISOString();
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;

    const response = await api.get<any>(this.BASE_URL, { params });
    return response.data.data;
  }

  // Update leave request status (approve/reject)
  async updateLeaveRequestStatus(
    id: string,
    status: LeaveRequestStatus,
    reason?: string
  ): Promise<LeaveRequestResponse> {
    const response = await api.patch<any>(`${this.BASE_URL}/${id}/status`, {
      status,
      reason,
    });
    return response.data.data;
  }

  // Calculate working days between two dates (considering holidays)
  async calculateWorkingDays(dto: CalculateWorkingDaysDto): Promise<number> {
    const response = await api.post<any>(`${this.BASE_URL}/calculate-days`, dto);
    return response.data.data.duration;
  }

  // Mark maternity leave request as BHXH claimed
  async claimBhxh(id: string): Promise<LeaveRequestResponse> {
    const response = await api.patch<any>(`${this.BASE_URL}/${id}/bhxh-claim`);
    return response.data.data;
  }
}

const leaveRequestService = new LeaveRequestService();
export default leaveRequestService;
