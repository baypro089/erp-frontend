import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import orderService from './order.service';
import type {
  OrderResponse,
  OrderListResponse,
  OrderTableReponse,
  CreateOrderDto,
  FulfillOrderDto,
} from '@libs/shared/types/order.type';
import { OrderStatus } from '@libs/shared/enums/order-status.enum';

const extractErrorMessage = (error: any, fallback: string): string => {
  const message = error?.response?.data?.message;

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  if (Array.isArray(message) && message.length > 0) {
    return message.filter(Boolean).join(', ');
  }

  if (message && typeof message === 'object') {
    const nestedMessage = (message as { message?: unknown }).message;
    if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
      return nestedMessage;
    }
    if (Array.isArray(nestedMessage) && nestedMessage.length > 0) {
      return nestedMessage.filter(Boolean).join(', ');
    }
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

interface OrderState {
  orders: OrderTableReponse[];
  pagedOrders: OrderListResponse | null;
  currentOrder: OrderResponse | null;
  pendingOrders: OrderTableReponse[]; // Đơn chờ xuất kho (dạng table)
  shippedOrders: OrderTableReponse[]; // Đơn đã xuất (dạng table)
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

const initialState: OrderState = {
  orders: [],
  pagedOrders: null,
  currentOrder: null,
  pendingOrders: [],
  shippedOrders: [],
  loading: false,
  error: null,
  operationLoading: false,
  operationError: null,
};

// Async thunks
export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (
    params: {
      code?: string;
      status?: OrderStatus;
      dateFrom?: string;
      dateTo?: string;
      totalAmountFrom?: number;
      totalAmountTo?: number;
      page?: number;
      pageSize?: number;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await orderService.getOrders(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to fetch orders'));
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to fetch order'));
    }
  }
);

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (data: CreateOrderDto, { rejectWithValue }) => {
    try {
      const response = await orderService.createOrder(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to create order'));
    }
  }
);

export const fulfillOrder = createAsyncThunk(
  'order/fulfillOrder',
  async (
    { orderId, data }: { orderId: string; data: FulfillOrderDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await orderService.fulfillOrder(orderId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to fulfill order'));
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async (
    {
      orderId,
      status,
      warehouseIdToReturn,
    }: {
      orderId: string;
      status: OrderStatus;
      warehouseIdToReturn?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await orderService.updateOrderStatus(
        orderId,
        status,
        warehouseIdToReturn
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to update order status'));
    }
  }
);

// Slice
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<OrderListResponse>) => {
        state.loading = false;
        state.pagedOrders = action.payload;
        state.orders = action.payload.items;
        
        // Phân loại đơn hàng cho màn hình fulfill
        state.pendingOrders = action.payload.items.filter(
          (order: OrderTableReponse) => order.status === OrderStatus.PENDING
        );
        state.shippedOrders = action.payload.items.filter(
          (order: OrderTableReponse) => order.status === OrderStatus.SHIPPED
        );
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch order by ID
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<OrderResponse>) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create order
    builder
      .addCase(createOrder.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(createOrder.fulfilled, (state, action: PayloadAction<OrderResponse>) => {
        state.operationLoading = false;
        // Convert OrderResponse to OrderTableReponse
        const tableOrder: OrderTableReponse = {
          id: action.payload.id,
          code: action.payload.code,
          totalAmount: action.payload.totalAmount,
          customerName: action.payload.customer.fullName,
          creatorName: action.payload.creator.username,
          status: action.payload.status,
          createdAt: action.payload.createdAt,
        };
        state.orders.unshift(tableOrder);
        if (action.payload.status === OrderStatus.PENDING) {
          state.pendingOrders.unshift(tableOrder);
        }
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Fulfill order
    builder
      .addCase(fulfillOrder.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(fulfillOrder.fulfilled, (state, action: PayloadAction<OrderResponse>) => {
        state.operationLoading = false;
        const updatedOrder = action.payload;
        
        // Convert OrderResponse to OrderTableReponse
        const tableOrder: OrderTableReponse = {
          id: updatedOrder.id,
          code: updatedOrder.code,
          totalAmount: updatedOrder.totalAmount,
          customerName: updatedOrder.customer.fullName,
          creatorName: updatedOrder.creator.username,
          status: updatedOrder.status,
          createdAt: updatedOrder.createdAt,
        };
        
        // Update in orders list
        const index = state.orders.findIndex((o) => o.id === updatedOrder.id);
        if (index !== -1) {
          state.orders[index] = tableOrder;
        }
        
        // Move from pending to shipped
        state.pendingOrders = state.pendingOrders.filter((o) => o.id !== updatedOrder.id);
        state.shippedOrders.unshift(tableOrder);
        
        // Update current order if it's the one being fulfilled
        if (state.currentOrder?.id === updatedOrder.id) {
          state.currentOrder = updatedOrder;
        }
      })
      .addCase(fulfillOrder.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Update order status
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<OrderResponse>) => {
        state.operationLoading = false;
        const updatedOrder = action.payload;
        
        // Convert OrderResponse to OrderTableReponse
        const tableOrder: OrderTableReponse = {
          id: updatedOrder.id,
          code: updatedOrder.code,
          totalAmount: updatedOrder.totalAmount,
          customerName: updatedOrder.customer.fullName,
          creatorName: updatedOrder.creator.username,
          status: updatedOrder.status,
          createdAt: updatedOrder.createdAt,
        };
        
        // Update in orders list
        const index = state.orders.findIndex((o) => o.id === updatedOrder.id);
        if (index !== -1) {
          state.orders[index] = tableOrder;
        }
        
        // Update in pending/shipped lists
        state.pendingOrders = state.pendingOrders.filter((o) => o.id !== updatedOrder.id);
        state.shippedOrders = state.shippedOrders.filter((o) => o.id !== updatedOrder.id);
        
        if (updatedOrder.status === OrderStatus.PENDING) {
          state.pendingOrders.push(tableOrder);
        } else if (updatedOrder.status === OrderStatus.SHIPPED) {
          state.shippedOrders.push(tableOrder);
        }
        
        // Update current order if it's the one being updated
        if (state.currentOrder?.id === updatedOrder.id) {
          state.currentOrder = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
