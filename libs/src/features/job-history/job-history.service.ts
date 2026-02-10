import api from '@libs/src/services/api.service';
import type {
  JobHistoryResponse,
  CreateJobHistoryDto,
} from '@libs/shared/types/job-histories.type';

export const jobHistoryService = {
  getJobHistoriesByEmployeeId: async (
    employeeId: string
  ): Promise<JobHistoryResponse[]> => {
    const response = await api.get(`/job-histories/employee/${employeeId}`);
    return response.data.data;
  },

  createJobHistory: async (
    data: CreateJobHistoryDto
  ): Promise<JobHistoryResponse> => {
    const response = await api.post('/job-histories', data);
    return response.data.data;
  },
};
