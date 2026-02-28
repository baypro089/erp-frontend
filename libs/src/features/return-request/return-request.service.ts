import api from '@libs/src/services/api.service';
import type {
  ReturnRequestResponse,
  ReturnRequesTableListResponse,
  CreateReturnRequestDto,
} from '@libs/shared/types/return-request.type';
import type { OrderResponse } from '@libs/shared/types/order.type';

class ReturnRequestService {
  private readonly BASE_URL = '/commercial/return-requests';
  private readonly ORDERS_URL = '/orders';

  /**
   * Tạo phiếu trả hàng mới
   */
  async createReturnRequest(data: CreateReturnRequestDto): Promise<ReturnRequestResponse> {
    const response = await api.post<any>(this.BASE_URL, data);
    return response.data.data;
  }

  /**
   * Lấy danh sách phiếu trả hàng với filter & pagination
   */
  async getReturnRequests(params: {
    code?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ReturnRequesTableListResponse> {
    const response = await api.get<any>(this.BASE_URL, { params });
    return response.data.data;
  }

  /**
   * Lấy chi tiết phiếu trả hàng theo ID
   */
  async getReturnRequestById(id: string): Promise<ReturnRequestResponse> {
    const response = await api.get<any>(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }

  /**
   * Tra cứu đơn hàng theo mã đơn hoặc SĐT khách hàng
   * Trả về danh sách đơn hàng phù hợp
   */
  async searchOrders(query: string): Promise<OrderResponse[]> {
    const response = await api.get<any>(this.ORDERS_URL, {
      params: { code: query, page: 1, pageSize: 20 },
    });
    return response.data.data?.items ?? [];
  }

  /**
   * Lấy đơn hàng theo ID (để load form trả hàng)
   */
  async getOrderById(orderId: string): Promise<OrderResponse> {
    const response = await api.get<any>(`${this.ORDERS_URL}/${orderId}`);
    return response.data.data;
  }
}

export default new ReturnRequestService();
