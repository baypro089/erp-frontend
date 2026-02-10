import api from '@libs/src/services/api.service';
import type { HolidayResponse, CreateHolidayDto } from '@libs/shared/types/holiday.type';

class HolidayService {
  private readonly BASE_URL = '/holidays';

  // Get holidays by year
  async getHolidays(year: number): Promise<HolidayResponse[]> {
    const response = await api.get<any>(this.BASE_URL, { 
      params: { year } 
    });
    return response.data.data;
  }

  // Create new holiday
  async createHoliday(data: CreateHolidayDto): Promise<HolidayResponse> {
    const response = await api.post<any>(this.BASE_URL, data);
    return response.data.data;
  }

  // Delete holiday
  async deleteHoliday(id: number): Promise<void> {
    await api.delete(`${this.BASE_URL}/${id}`);
  }

  // Seed holidays for a year
  async seedHolidays(year: number): Promise<{ message: string }> {
    const response = await api.post<any>(`${this.BASE_URL}/seed`, { year });
    return response.data.data;
  }
}

export default new HolidayService();
