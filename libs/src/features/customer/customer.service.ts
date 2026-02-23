import api from '@libs/src/services/api.service';
import type {
  CustomerResponse,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerListResponse,
} from '@libs/shared/types/customer.type';
import { CustomerTier } from '@libs/shared/enums/customer-tier.enum';

class CustomerService {
  private readonly BASE_URL = '/customers';

  // Get customers with pagination and filters
  async getCustomers(
    fullName?: string,
    phoneNumber?: string,
    tier?: CustomerTier,
    isActive?: boolean,
    page?: number,
    pageSize?: number
  ): Promise<CustomerListResponse> {
    const params: any = {};
    if (fullName) params.fullName = fullName;
    if (phoneNumber) params.phoneNumber = phoneNumber;
    if (tier) params.tier = tier;
    if (isActive !== undefined) params.isActive = isActive;
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;

    const response = await api.get<any>(this.BASE_URL, { params });
    return response.data.data;
  }

  // Get customer by ID
  async getCustomerById(id: string): Promise<CustomerResponse> {
    const response = await api.get<any>(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }

  // Get customer by phone number
  async getCustomerByPhone(phone: string): Promise<CustomerResponse> {
    const response = await api.get<any>(`${this.BASE_URL}/phone/${phone}`);
    return response.data.data;
  }

  // Create new customer
  async createCustomer(data: CreateCustomerDto): Promise<CustomerResponse> {
    const response = await api.post<any>(this.BASE_URL, data);
    return response.data.data;
  }

  // Update customer
  async updateCustomer(id: string, data: UpdateCustomerDto): Promise<CustomerResponse> {
    const response = await api.put<any>(`${this.BASE_URL}/${id}`, data);
    return response.data.data;
  }

  // Delete customers
  async deleteCustomers(ids: string[]): Promise<void> {
    await api.delete<any>(this.BASE_URL, { data: { ids } });
  }
}

export default new CustomerService();
