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
import { PageHeader, LoadingOverlay, StatusChip, PermissionGuard } from '@libs/src/components/common';
import { usePermissionGuard } from '@libs/src/hooks';
import { PERMISSIONS } from '@libs/shared/constants/permissions.constant';
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
  return (
    <PermissionGuard 
      permission={PERMISSIONS.ORDER.VIEW}
      fallbackPath="/commercial/orders"
    >
      <OrderDetailPageContent />
    </PermissionGuard>
  );
}

function OrderDetailPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { guardAction } = usePermissionGuard();

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
    const order = currentOrder;
    if (!order) return;

    const fmt = (n: number) =>
      new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

    const fmtDate = (d: string | Date) =>
      new Date(d).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });

    const statusLabel: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]:    'Chờ xuất kho',
      [OrderStatus.PROCESSING]: 'Đang xử lý',
      [OrderStatus.SHIPPED]:    'Đã xuất kho',
      [OrderStatus.DELIVERED]:  'Đã giao',
      [OrderStatus.CANCELLED]:  'Đã hủy',
    };
    const statusClass: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]:    'pending',
      [OrderStatus.PROCESSING]: 'pending',
      [OrderStatus.SHIPPED]:    'completed',
      [OrderStatus.DELIVERED]:  'completed',
      [OrderStatus.CANCELLED]:  'rejected',
    };

    const itemRows = order.items
      .map(
        (item, idx) => `
        <tr>
          <td class="center">${idx + 1}</td>
          <td>
            <strong>${item.product.name}</strong>
            ${item.product.sku ? `<br/><span class="sku">SKU: ${item.product.sku}</span>` : ''}
            ${item.assignedSerials && item.assignedSerials.length > 0 ? `<br/><span class="serial-list">Serial: ${item.assignedSerials.join(', ')}</span>` : ''}
          </td>
          <td class="center">${item.quantity}</td>
          <td class="right">${fmt(item.unitPrice)}</td>
          <td class="right bold">${fmt(item.amount)}</td>
        </tr>`
      )
      .join('');

    const subtotalAmt = order.items.reduce((s, i) => s + i.amount, 0);
    const discAmt = order.discountAmount || 0;

    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Đơn Hàng ${order.code}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:Arial,sans-serif; font-size:13px; color:#111; background:#fff; }
    .page { width:210mm; min-height:297mm; margin:0 auto; padding:16mm 14mm; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #1565c0; padding-bottom:12px; margin-bottom:12px; }
    .company h1 { font-size:20px; color:#1565c0; font-weight:800; letter-spacing:1px; }
    .company p { font-size:11px; color:#555; margin-top:2px; }
    .doc-info { text-align:right; }
    .doc-info .code { font-size:22px; font-weight:800; color:#e65100; }
    .doc-info .title { font-size:11px; color:#777; text-transform:uppercase; letter-spacing:1px; }
    .doc-info .date  { font-size:11px; color:#555; margin-top:3px; }
    .status-row { text-align:center; margin:10px 0 14px; }
    .badge { display:inline-block; padding:4px 20px; border-radius:20px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; }
    .completed { background:#e8f5e9; color:#2e7d32; border:1px solid #a5d6a7; }
    .pending   { background:#fff8e1; color:#e65100; border:1px solid #ffe082; }
    .rejected  { background:#ffebee; color:#c62828; border:1px solid #ef9a9a; }
    .two-col { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
    .section { margin-bottom:14px; }
    .section-title { font-size:12px; font-weight:700; text-transform:uppercase; color:#1565c0; letter-spacing:.5px; border-left:4px solid #1565c0; padding-left:8px; margin-bottom:8px; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px 16px; }
    .label { font-size:10px; color:#777; text-transform:uppercase; letter-spacing:.4px; }
    .value { font-size:13px; font-weight:600; color:#111; margin-top:1px; }
    .note-box { background:#f5f5f5; border:1px solid #e0e0e0; border-radius:6px; padding:10px 12px; font-size:12px; color:#333; line-height:1.6; }
    table { width:100%; border-collapse:collapse; font-size:12px; }
    th { background:#1565c0; color:#fff; padding:7px 8px; text-align:left; font-size:11px; text-transform:uppercase; }
    th.center, td.center { text-align:center; }
    th.right,  td.right  { text-align:right; }
    td { padding:7px 8px; border-bottom:1px solid #eee; vertical-align:top; }
    tr:nth-child(even) td { background:#fafafa; }
    .subtotal-row td { background:#f5f5f5 !important; font-weight:600; }
    .discount-row td { color:#c62828; }
    .total-row td { background:#e3f2fd !important; font-weight:700; font-size:14px; border-top:2px solid #1565c0; }
    .total-amount { color:#c62828; font-size:16px; }
    .bold { font-weight:700; }
    .sku { color:#888; font-size:11px; }
    .serial-list { color:#1565c0; font-size:11px; word-break:break-all; }
    .signatures { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:24px; }
    .sig-box { border:1px dashed #bbb; border-radius:6px; padding:12px; text-align:center; min-height:90px; }
    .sig-title { font-size:11px; font-weight:700; text-transform:uppercase; color:#555; margin-bottom:4px; }
    .sig-sub { font-size:10px; color:#999; }
    .sig-name { font-size:12px; font-weight:600; color:#222; margin-top:4px; }
    .note { font-size:10.5px; color:#777; font-style:italic; margin-top:14px; text-align:center; border-top:1px solid #eee; padding-top:10px; }
    hr.divider { border:none; border-top:1px solid #e0e0e0; margin:12px 0; }
    @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } .page { padding:10mm 12mm; } }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="company">
      <h1>ERP COMMERCIAL</h1>
      <p>Hệ thống quản lý thương mại</p>
      <p style="margin-top:6px;font-size:12px;color:#333;"><strong>ĐƠN HÀNG BÁN</strong></p>
    </div>
    <div class="doc-info">
      <div class="title">Mã đơn hàng</div>
      <div class="code">${order.code}</div>
      <div class="date">Ngày tạo: ${fmtDate(order.createdAt)}</div>
    </div>
  </div>
  <div class="status-row">
    <span class="badge ${statusClass[order.status]}">
      Trạng thái: ${statusLabel[order.status]}
    </span>
  </div>
  <div class="two-col">
    <div class="section">
      <div class="section-title">Thông tin đơn hàng</div>
      <div class="info-grid" style="grid-template-columns:1fr 1fr">
        <div><div class="label">Mã đơn hàng</div><div class="value" style="color:#1565c0">${order.code}</div></div>
        <div><div class="label">Người tạo</div><div class="value">${order.creator.username}</div></div>
        <div><div class="label">Ngày tạo</div><div class="value">${fmtDate(order.createdAt)}</div></div>
        <div><div class="label">Cập nhật</div><div class="value">${fmtDate(order.updatedAt)}</div></div>
      </div>
      ${order.note ? `<div style="margin-top:10px"><div class="label" style="margin-bottom:4px">Ghi chú</div><div class="note-box">${order.note}</div></div>` : ''}
    </div>
    <div class="section">
      <div class="section-title">Thông tin khách hàng</div>
      <div class="info-grid" style="grid-template-columns:1fr">
        <div><div class="label">Tên khách hàng</div><div class="value">${order.customer.fullName}</div></div>
        <div><div class="label">Số điện thoại</div><div class="value">${order.customer.phoneNumber}</div></div>
        ${order.customer.email ? `<div><div class="label">Email</div><div class="value">${order.customer.email}</div></div>` : ''}
        ${order.customer.address ? `<div><div class="label">Địa chỉ</div><div class="value">${order.customer.address}</div></div>` : ''}
      </div>
    </div>
  </div>
  <hr class="divider" />
  <div class="section">
    <div class="section-title">Danh sách sản phẩm (${order.items.length} mặt hàng)</div>
    <table>
      <thead>
        <tr>
          <th class="center" style="width:5%">STT</th>
          <th style="width:40%">Sản phẩm</th>
          <th class="center" style="width:10%">SL</th>
          <th class="right" style="width:20%">Đơn giá</th>
          <th class="right" style="width:25%">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
        <tr class="subtotal-row">
          <td colspan="4" style="text-align:right;padding-right:12px;">Tạm tính:</td>
          <td class="right">${fmt(subtotalAmt)}</td>
        </tr>
        ${discAmt > 0 ? `<tr class="discount-row"><td colspan="4" style="text-align:right;padding-right:12px;">Chiết khấu:</td><td class="right">-${fmt(discAmt)}</td></tr>` : ''}
        <tr class="total-row">
          <td colspan="4" style="text-align:right;padding-right:12px;">Tổng cộng:</td>
          <td class="right total-amount">${fmt(order.totalAmount)}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="signatures">
    <div class="sig-box">
      <div class="sig-title">Khách hàng xác nhận</div>
      <div class="sig-sub">(Ký, ghi rõ họ tên)</div><br/><br/>
      <div class="sig-name">${order.customer.fullName}</div>
    </div>
    <div class="sig-box">
      <div class="sig-title">Nhân viên bán hàng</div>
      <div class="sig-sub">(Ký, ghi rõ họ tên)</div><br/><br/>
      <div class="sig-name">${order.creator.username}</div>
    </div>
  </div>
  <p class="note">Đây là chứng từ bán hàng hợp lệ. Vui lòng giữ lại để đối chiếu khi cần.<br/>In lúc: ${new Date().toLocaleString('vi-VN')}</p>
</div>
<script>window.onload = function () { window.print(); };<\/script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
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
