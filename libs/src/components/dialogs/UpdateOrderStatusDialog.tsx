'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Typography,
  Chip,
  FormHelperText,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { OrderStatus } from '@libs/shared/enums/order-status.enum';
import type { OrderResponse } from '@libs/shared/types/order.type';
import type { WarehouseResponse } from '@libs/shared/types/warehouse.type';

interface UpdateOrderStatusDialogProps {
  open: boolean;
  order: OrderResponse | null;
  warehouses: WarehouseResponse[];
  onClose: () => void;
  onConfirm: (status: OrderStatus, warehouseIdToReturn?: string) => void;
  loading?: boolean;
}

interface StatusOption {
  value: OrderStatus;
  label: string;
  description: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  icon: React.ReactNode;
}

export default function UpdateOrderStatusDialog({
  open,
  order,
  warehouses,
  onClose,
  onConfirm,
  loading = false,
}: UpdateOrderStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [warehouseIdToReturn, setWarehouseIdToReturn] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Reset form khi mở dialog
  useEffect(() => {
    if (open && order) {
      setSelectedStatus('');
      setWarehouseIdToReturn('');
      setError('');
    }
  }, [open, order]);

  if (!order) return null;

  // Xác định các trạng thái có thể chuyển đến dựa vào trạng thái hiện tại
  const getAvailableStatuses = (): StatusOption[] => {
    const options: StatusOption[] = [];

    switch (order.status) {
      case OrderStatus.PENDING:
        // KỊCH BẢN 1: PENDING -> CANCELLED
        options.push({
          value: OrderStatus.CANCELLED,
          label: 'Hủy đơn',
          description: 'Hủy đơn hàng chưa xuất kho',
          color: 'error',
          icon: <CancelIcon />,
        });
        break;

      case OrderStatus.SHIPPED:
        // KỊCH BẢN 2: SHIPPED -> DELIVERED
        options.push({
          value: OrderStatus.DELIVERED,
          label: 'Giao hàng thành công',
          description: 'Xác nhận đã giao hàng cho khách, ghi nhận doanh thu',
          color: 'success',
          icon: <CheckIcon />,
        });
        // KỊCH BẢN 3: SHIPPED -> CANCELLED (yêu cầu chọn kho)
        options.push({
          value: OrderStatus.CANCELLED,
          label: 'Hủy đơn',
          description: 'Hoàn hàng về kho, hoàn tác chi tiêu khách hàng',
          color: 'error',
          icon: <CancelIcon />,
        });
        break;

      case OrderStatus.PROCESSING:
        // KỊCH BẢN 3: PROCESSING -> CANCELLED (yêu cầu chọn kho)
        options.push({
          value: OrderStatus.CANCELLED,
          label: 'Hủy đơn',
          description: 'Hoàn hàng về kho, hoàn tác chi tiêu khách hàng',
          color: 'error',
          icon: <CancelIcon />,
        });
        break;

      case OrderStatus.DELIVERED:
        // Đơn đã giao không thể đổi trạng thái (trừ quy trình RMA)
        break;

      case OrderStatus.CANCELLED:
        // Đơn đã hủy không thể đổi trạng thái
        break;
    }

    return options;
  };

  const availableStatuses = getAvailableStatuses();

  // Kiểm tra có cần chọn kho không
  const needsWarehouse =
    selectedStatus === OrderStatus.CANCELLED &&
    (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.PROCESSING);

  // Validate form
  const handleConfirm = () => {
    if (!selectedStatus) {
      setError('Vui lòng chọn trạng thái mới');
      return;
    }

    if (needsWarehouse && !warehouseIdToReturn) {
      setError('Vui lòng chọn kho nhận hàng hoàn trả');
      return;
    }

    onConfirm(selectedStatus as OrderStatus, warehouseIdToReturn || undefined);
  };

  // Hiển thị trạng thái hiện tại
  const getCurrentStatusChip = () => {
    const statusConfig: Record<
      OrderStatus,
      { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' }
    > = {
      [OrderStatus.PENDING]: { label: 'Chờ xử lý', color: 'warning' },
      [OrderStatus.PROCESSING]: { label: 'Đang xử lý', color: 'info' },
      [OrderStatus.SHIPPED]: { label: 'Đã xuất kho', color: 'primary' },
      [OrderStatus.DELIVERED]: { label: 'Đã giao hàng', color: 'success' },
      [OrderStatus.CANCELLED]: { label: 'Đã hủy', color: 'error' },
    };

    const config = statusConfig[order.status];
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
      <DialogContent>
        {/* Thông tin đơn hàng */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Mã đơn hàng
          </Typography>
          <Typography variant="h6" gutterBottom>
            {order.code}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Trạng thái hiện tại
          </Typography>
          {getCurrentStatusChip()}
        </Box>

        {/* Kiểm tra xem có thể đổi trạng thái không */}
        {availableStatuses.length === 0 ? (
          <Alert severity="info" icon={<WarningIcon />}>
            {order.status === OrderStatus.DELIVERED && (
              <>Đơn hàng đã giao thành công. Để xử lý trả hàng, vui lòng dùng quy trình RMA (Return Merchandise Authorization).</>
            )}
            {order.status === OrderStatus.CANCELLED && (
              <>Đơn hàng đã được hủy. Không thể thay đổi trạng thái.</>
            )}
          </Alert>
        ) : (
          <>
            {/* Chọn trạng thái mới */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Trạng thái mới *</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value as OrderStatus);
                  setError('');
                }}
                label="Trạng thái mới *"
              >
                {availableStatuses.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {option.icon}
                      <Box>
                        <Typography variant="body1">{option.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.description}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {error && !selectedStatus && <FormHelperText error>{error}</FormHelperText>}
            </FormControl>

            {/* Chọn kho nhận hàng hoàn trả (nếu cần) */}
            {needsWarehouse && (
              <>
                <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Lưu ý: Hủy đơn đã xuất kho
                  </Typography>
                  <Typography variant="body2">
                    • Hàng sẽ được hoàn trả về kho bạn chọn
                    <br />
                    • Serial sẽ chuyển về trạng thái SẴN SÀNG
                    <br />
                    • Tồn kho sẽ được cộng lại
                    <br />• Chi tiêu của khách hàng sẽ bị trừ đi
                  </Typography>
                </Alert>

                <FormControl fullWidth>
                  <InputLabel>Chọn kho nhận hàng hoàn trả *</InputLabel>
                  <Select
                    value={warehouseIdToReturn}
                    onChange={(e) => {
                      setWarehouseIdToReturn(e.target.value);
                      setError('');
                    }}
                    label="Chọn kho nhận hàng hoàn trả *"
                  >
                    {warehouses
                      .filter((w) => w.isActive)
                      .map((warehouse) => (
                        <MenuItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} ({warehouse.code})
                        </MenuItem>
                      ))}
                  </Select>
                  {error && needsWarehouse && !warehouseIdToReturn && (
                    <FormHelperText error>{error}</FormHelperText>
                  )}
                </FormControl>
              </>
            )}

            {/* Cảnh báo chung */}
            {selectedStatus && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  {selectedStatus === OrderStatus.CANCELLED && order.status === OrderStatus.PENDING && (
                    <>Hủy đơn hàng chưa xuất kho. Hàng vẫn trong kho, không cần xử lý hoàn trả.</>
                  )}
                  {selectedStatus === OrderStatus.DELIVERED && (
                    <>
                      Xác nhận giao hàng thành công. Doanh thu sẽ được ghi nhận và cộng vào tổng chi tiêu của khách
                      hàng.
                    </>
                  )}
                </Typography>
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        {availableStatuses.length > 0 && (
          <Button onClick={handleConfirm} variant="contained" disabled={loading || !selectedStatus}>
            {loading ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
