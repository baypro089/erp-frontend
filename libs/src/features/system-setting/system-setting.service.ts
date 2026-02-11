import apiService from '@libs/src/services/api.service';
import type { SystemSettingResponse, SystemSettingUpdateDto } from '@libs/shared/types/system-setting.type';
import { SalaryComponentResponse } from '@libs/shared/types/salary-component.type';

const systemSettingService = {
  async getAllSettings(): Promise<SystemSettingResponse[]> {
    const response = await apiService.get<{ data: SystemSettingResponse[] }>('/system-settings');
    return response.data.data;
  },

  async updateSetting(key: string, data: SystemSettingUpdateDto): Promise<SystemSettingResponse> {
    const response = await apiService.patch<{ data: SystemSettingResponse }>(`/system-settings/${key}`, data);
    return response.data.data;
  },

  async getAllSalaryComponents(): Promise<SalaryComponentResponse[]> {
    const response = await apiService.get<{ data: SalaryComponentResponse[] }>('/system-settings/salary-components');
    return response.data.data;
  },
};

export default systemSettingService;
