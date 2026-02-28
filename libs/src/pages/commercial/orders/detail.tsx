'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  LocalShipping as ShippingIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  AccountBalanceWallet as WalletIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { PageHeader, LoadingOverlay, StatusChip } from '@libs/src/components/common';
import {
  fetchOrderById,
  updateOrderStatus,
  clearError,
} from '@libs/src/features/order/order.slice';
import { fetchWarehouses } from '@libs/src/features/warehouse/warehouse.slice';
import UpdateOrderStatusDialog from '@libs/src/components/dialogs/UpdateOrderStatusDialog';
import type { OrderResponse } from '@libs/shared/types/order.type';
import { OrderStatus } from '@libs/shared/enums/order-status.enum';

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Chờ xuất kho',
  [OrderStatus.PROCESSING]: 'Đang xử lý',
  [OrderStatus.SHIPPED]: 'Đã xuất kho',
  [OrderStatus.DELIVERED]: 'Đã giao',
  [OrderStatus.CANCELLED]: 'Đã hủy',
};

export default function OrderDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const { currentOrder, loading, operationLoading, operationError } = useSelector(
    (state: RootState) => state.order
  );
  const { warehouses } = useSelector((state: RootState) => state.warehouse);

  // Dialog states
  const [openCancel, setOpenCancel] = useState(false);
  const [openUpdateStatus, setOpenUpdateStatus] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Load data
  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
      dispatch(fetchWarehouses());
    }
  }, [orderId, dispatch]);

  // Handle errors
  useEffect(() => {
    if (operationError) {
      setSnackbar({
        open: true,
        message: operationError,
        severity: 'error',
      });
      dispatch(clearError());
    }
  }, [operationError, dispatch]);

  // Actions
  const handleBack = () => {
    router.push('/commercial/orders');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCancelOrder = async () => {
    if (!currentOrder) return;

    try {
      await dispatch(
        updateOrderStatus({
          orderId: currentOrder.id,
          status: OrderStatus.CANCELLED,
        })
      ).unwrap();

      setSnackbar({
        open: true,
        message: 'Hủy đơn hàng thành công',
        severity: 'success',
      });
      setOpenCancel(false);
      dispatch(fetchOrderById(orderId));
    } catch (error) {
      // Error handled by useEffect
    }
  };

  const handleConfirmUpdateStatus = async (status: OrderStatus, warehouseIdToReturn?: string) => {
    if (!currentOrder) return;

    try {
      await dispatch(
        updateOrderStatus({
          orderId: currentOrder.id,
          status,
          warehouseIdToReturn,
        })
      ).unwrap();

      setSnackbar({
        open: true,
        message: 'Cập nhật trạng thái đơn hàng thành công',
        severity: 'success',
      });
      setOpenUpdateStatus(false);
      dispatch(fetchOrderById(orderId));
    } catch (error) {
      // Error handled by useEffect
    }
  };

  const handleGoToFulfillment = () => {
    router.push('/commercial/warehouse/fulfillment');
  };

  // Status badge
  const getStatusChip = (status: OrderStatus) => {
    const config: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'pending',
      [OrderStatus.PROCESSING]: 'processing',
      [OrderStatus.SHIPPED]: 'completed',
      [OrderStatus.DELIVERED]: 'delivered',
      [OrderStatus.CANCELLED]: 'cancelled',
    };
    return <StatusChip status={config[status]} />;
  };

  if (loading && !currentOrder) {
    return <LoadingOverlay open={true} message="Đang tải chi tiết đơn hàng..." />;
  }

  if (!currentOrder && !loading) {
    return (
      <Box p={4}>
        <Alert severity="error">
          Không tìm thấy đơn hàng.{' '}
          <Button size="small" onClick={handleBack}>
            Quay lại
          </Button>
        </Alert>
      </Box>
    );
  }

  if (!currentOrder) return null;

  // Calculate summary
  const subtotal = currentOrder.items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = currentOrder.discountAmount || 0;
  const total = currentOrder.totalAmount;

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title={`Đơn hàng #${currentOrder.code}`}
        subtitle={ORDER_STATUS_LABELS[currentOrder.status]}
        breadcrumbs={[
          { label: 'Đơn hàng', href: '/commercial/orders' },
          { label: currentOrder.code },
        ]}
        actions={[
          {
            label: 'Quay lại',
            onClick: handleBack,
            icon: <BackIcon />,
            variant: 'outlined',
          },
          {
            label: 'In đơn',
            onClick: handlePrint,
            icon: <PrintIcon />,
            variant: 'outlined',
          },
          ...(currentOrder.status === OrderStatus.PENDING
            ? [
                {
                  label: 'Cập nhật trạng thái',
                  onClick: () => setOpenUpdateStatus(true),
                  icon: <EditIcon />,
                  variant: 'contained' as const,
                },
              ]
            : []),
        ]}
      />

      <Grid container spacing={3}>
        {/* Left Column - Main Info */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* Order Status Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" display="flex" alignItems="center" gap={1}>
                  <AssignmentIcon color="primary" />
                  Thông tin đơn hàng
                </Typography>
                {getStatusChip(currentOrder.status)}
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Mã đơn hàng
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {currentOrder.code}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Ngày tạo
                  </Typography>
                  <Typography variant="body1">
                    {new Date(currentOrder.createdAt).toLocaleString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Người tạo
                  </Typography>
                  <Typography variant="body1">{currentOrder.creator.username}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Cập nhật lần cuối
                  </Typography>
                  <Typography variant="body1">
                    {new Date(currentOrder.updatedAt).toLocaleString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Grid>
              </Grid>

              {currentOrder.note && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="caption" color="text.secondary">
                    Ghi chú
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {currentOrder.note}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>

          {/* Order Items Card */}
          <Card>
            <CardContent>
              <Typography variant="h6" display="flex" alignItems="center" gap={1} mb={2}>
                <InventoryIcon color="primary" />
                Sản phẩm ({currentOrder.items.length})
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tên sản phẩm</TableCell>
                      <TableCell align="center">Số lượng</TableCell>
                      <TableCell align="right">Đơn giá</TableCell>
                      <TableCell align="right">Thành tiền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentOrder.items.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {item.product.name}
                          </Typography>
                          {item.product.sku && (
                            <Typography variant="caption" color="text.secondary">
                              SKU: {item.product.sku}
                            </Typography>
                          )}
                          {item.assignedSerials && item.assignedSerials.length > 0 && (
                            <Box mt={1}>
                              <Typography variant="caption" color="text.secondary">
                                Serial Numbers:
                              </Typography>
                              <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                                {item.assignedSerials.map((serial) => (
                                  <Chip
                                    key={serial}
                                    label={serial}
                                    size="small"
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={item.quantity} size="small" />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {item.unitPrice.toLocaleString('vi-VN')}₫
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {item.amount.toLocaleString('vi-VN')}₫
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Customer & Summary */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {/* Customer Info Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" display="flex" alignItems="center" gap={1} mb={2}>
                <PersonIcon color="primary" />
                Thông tin khách hàng
              </Typography>

              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Tên khách hàng
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {currentOrder.customer.fullName}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Số điện thoại
                  </Typography>
                  <Typography variant="body1">{currentOrder.customer.phoneNumber}</Typography>
                </Box>

                {currentOrder.customer.email && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{currentOrder.customer.email}</Typography>
                  </Box>
                )}

                {currentOrder.customer.address && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Địa chỉ
                    </Typography>
                    <Typography variant="body1">{currentOrder.customer.address}</Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Order Summary Card */}
          <Card>
            <CardContent>
              <Typography variant="h6" display="flex" alignItems="center" gap={1} mb={2}>
                <WalletIcon color="primary" />
                Tổng quan đơn hàng
              </Typography>

              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Tạm tính:
                  </Typography>
                  <Typography variant="body2">{subtotal.toLocaleString('vi-VN')}₫</Typography>
                </Box>

                {discountAmount > 0 && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Chiết khấu:
                    </Typography>
                    <Typography variant="body2" color="error">
                      -{discountAmount.toLocaleString('vi-VN')}₫
                    </Typography>
                  </Box>
                )}

                <Divider />

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Tổng cộng:</Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {total.toLocaleString('vi-VN')}₫
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {currentOrder.status === OrderStatus.PENDING && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thao tác
                </Typography>
                <Stack spacing={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<ShippingIcon />}
                    onClick={handleGoToFulfillment}
                    size="large"
                  >
                    Đi xuất kho
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => setOpenCancel(true)}
                  >
                    Hủy đơn hàng
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={openCancel} onClose={() => setOpenCancel(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Bạn có chắc chắn muốn hủy đơn hàng <strong>#{currentOrder.code}</strong>? Hành động
            này không thể hoàn tác.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancel(false)}>Không</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelOrder}
            disabled={operationLoading}
          >
            Xác nhận hủy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <UpdateOrderStatusDialog
        open={openUpdateStatus}
        order={currentOrder}
        warehouses={warehouses}
        onClose={() => setOpenUpdateStatus(false)}
        onConfirm={handleConfirmUpdateStatus}
        loading={operationLoading}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {operationLoading && <LoadingOverlay open={true} message="Đang xử lý..." />}
    </Box>
  );
}
