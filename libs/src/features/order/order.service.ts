import api from '@libs/src/services/api.service';
import type {
  OrderResponse,
  OrderListResponse,
  CreateOrderDto,
  FulfillOrderDto,
} from '@libs/shared/types/order.type';
import { OrderStatus } from '@libs/shared/enums/order-status.enum';

class OrderService {
  private readonly BASE_URL = '/orders';

  /**
   * Tạo đơn hàng mới (Sale)
   */
  async createOrder(data: CreateOrderDto): Promise<OrderResponse> {
    const response = await api.post<any>(this.BASE_URL, data);
    return response.data.data;
  }

  /**
   * Xuất hàng / Fulfill order (Kho)
   */
  async fulfillOrder(orderId: string, data: FulfillOrderDto): Promise<OrderResponse> {
    const response = await api.post<any>(`${this.BASE_URL}/${orderId}/fulfill`, data);
    return response.data.data;
  }

  /**
   * Cập nhật trạng thái đơn hàng
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    warehouseIdToReturn?: string
  ): Promise<OrderResponse> {
    const response = await api.patch<any>(`${this.BASE_URL}/${orderId}/status`, {
      status,
      warehouseIdToReturn,
    });
    return response.data.data;
  }

  /**
   * Lấy danh sách đơn hàng với filters và pagination
   */
  async getOrders(params: {
    code?: string;
    status?: OrderStatus;
    dateFrom?: string;
    dateTo?: string;
    totalAmountFrom?: number;
    totalAmountTo?: number;
    page?: number;
    pageSize?: number;
  }): Promise<OrderListResponse> {
    const response = await api.get<any>(this.BASE_URL, { params });
    return response.data.data;
  }

  /**
   * Lấy chi tiết đơn hàng theo ID
   */
  async getOrderById(id: string): Promise<OrderResponse> {
    const response = await api.get<any>(`${this.BASE_URL}/${id}`);
    return response.data.data;
  }
}

export default new OrderService();
