'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Chip,
  Grid,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  QrCode as QrCodeIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { PageHeader, LoadingOverlay, StatusChip, PermissionGuard } from '@libs/src/components/common';
import { PERMISSIONS } from '@libs/shared/constants/permissions.constant';
import { SerialListModal } from '@libs/src/components/import-receipts';
import {
  fetchImportReceiptById,
  clearError,
} from '@libs/src/features/import-receipt/import-receipt.slice';
import type { ImportDetailResponse } from '@libs/shared/types/import-detail.type';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ImportReceiptDetailPage() {
  return (
    <PermissionGuard 
      permission={PERMISSIONS.IMPORT_RECEIPT.VIEW}
      fallbackPath="/commercial/imports"
    >
      <ImportReceiptDetailPageContent />
    </PermissionGuard>
  );
}

function ImportReceiptDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentImportReceipt, loading, error } = useSelector(
    (state: RootState) => state.importReceipt
  );

  const [openSerialModal, setOpenSerialModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ImportDetailResponse | null>(null);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Fetch receipt detail
  useEffect(() => {
    if (params.id) {
      dispatch(fetchImportReceiptById(params.id as string));
    }
  }, [dispatch, params.id]);

  // Handle errors
  useEffect(() => {
    if (error) {
      setSnackbar({
        open: true,
        message: error,
        severity: 'error',
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Print receipt
  const handlePrint = () => {
    const receipt = currentImportReceipt;
    if (!receipt) return;

    const fmt = (n: number) =>
      new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

    const statusLabel: Record<string, string> = {
      COMPLETED: 'Hoàn thành',
      PENDING: 'Chờ xử lý',
      CANCELLED: 'Đã hủy',
    };
    const statusClass: Record<string, string> = {
      COMPLETED: 'completed',
      PENDING: 'pending',
      CANCELLED: 'rejected',
    };

    const itemRows = receipt.items
      .map(
        (item, idx) => `
        <tr>
          <td class="center">${idx + 1}</td>
          <td>
            <strong>${item.product.name}</strong><br/>
            <span class="sku">${item.product.sku || 'N/A'}</span>
            ${item.scannedSerials && item.scannedSerials.length > 0 ? `<br/><span class="serial-list">Serial: ${item.scannedSerials.join(', ')}</span>` : ''}
          </td>
          <td class="right">${fmt(item.unitPrice)}</td>
          <td class="center">${item.quantity}</td>
          <td class="right bold">${fmt(item.amount)}</td>
        </tr>`
      )
      .join('');

    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Phiếu Nhập Kho ${receipt.code}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; font-size:13px; color:#111; background:#fff; }
    .page { width:210mm; min-height:297mm; margin:0 auto; padding:16mm 14mm; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #1565c0; padding-bottom:12px; margin-bottom:12px; }
    .company h1 { font-size:20px; color:#1565c0; font-weight:800; letter-spacing:1px; }
    .company p { font-size:11px; color:#555; margin-top:2px; }
    .doc-info { text-align:right; }
    .doc-info .code { font-size:22px; font-weight:800; color:#e65100; }
    .doc-info .title { font-size:11px; color:#777; text-transform:uppercase; letter-spacing:1px; }
    .doc-info .date { font-size:11px; color:#555; margin-top:3px; }
    .status-row { text-align:center; margin:10px 0 14px; }
    .badge { display:inline-block; padding:4px 20px; border-radius:20px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; }
    .completed { background:#e8f5e9; color:#2e7d32; border:1px solid #a5d6a7; }
    .pending   { background:#fff8e1; color:#e65100; border:1px solid #ffe082; }
    .rejected  { background:#ffebee; color:#c62828; border:1px solid #ef9a9a; }
    .section { margin-bottom:14px; }
    .section-title { font-size:12px; font-weight:700; text-transform:uppercase; color:#1565c0; letter-spacing:.5px; border-left:4px solid #1565c0; padding-left:8px; margin-bottom:8px; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px 16px; }
    .info-grid.two { grid-template-columns:1fr 1fr; }
    .label { font-size:10px; color:#777; text-transform:uppercase; letter-spacing:.4px; }
    .value { font-size:13px; font-weight:600; color:#111; margin-top:1px; }
    .note-box { background:#f5f5f5; border:1px solid #e0e0e0; border-radius:6px; padding:10px 12px; font-size:12px; color:#333; line-height:1.6; }
    table { width:100%; border-collapse:collapse; font-size:12px; }
    th { background:#1565c0; color:#fff; padding:7px 8px; text-align:left; font-size:11px; text-transform:uppercase; }
    th.center, td.center { text-align:center; }
    th.right,  td.right  { text-align:right; }
    td { padding:7px 8px; border-bottom:1px solid #eee; vertical-align:top; }
    tr:nth-child(even) td { background:#fafafa; }
    .total-row td { background:#e3f2fd !important; font-weight:700; font-size:13px; border-top:2px solid #1565c0; }
    .total-amount { color:#c62828; font-size:15px; }
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
      <p style="margin-top:6px;font-size:12px;color:#333;"><strong>PHIẾU NHẬP KHO</strong></p>
    </div>
    <div class="doc-info">
      <div class="title">Mã phiếu nhập</div>
      <div class="code">${receipt.code}</div>
      <div class="date">Ngày lập: ${format(new Date(receipt.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
    </div>
  </div>
  <div class="status-row">
    <span class="badge ${statusClass[receipt.status] ?? 'pending'}">
      Trạng thái: ${statusLabel[receipt.status] ?? receipt.status}
    </span>
  </div>
  <div class="section">
    <div class="section-title">Thông tin phiếu nhập</div>
    <div class="info-grid">
      <div><div class="label">Mã phiếu</div><div class="value" style="color:#1565c0">${receipt.code}</div></div>
      <div><div class="label">Kho nhập</div><div class="value">${receipt.warehouse.name} (${receipt.warehouse.code})</div></div>
      <div><div class="label">Nhà cung cấp</div><div class="value">${receipt.supplier?.name ?? '—'}</div></div>
      <div><div class="label">Người tạo</div><div class="value">${receipt.createdBy.username}</div></div>
      <div><div class="label">Ngày tạo</div><div class="value">${format(new Date(receipt.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</div></div>
    </div>
    ${receipt.note ? `<div style="margin-top:10px"><div class="label" style="margin-bottom:4px">Ghi chú</div><div class="note-box">${receipt.note}</div></div>` : ''}
  </div>
  <hr class="divider" />
  <div class="section">
    <div class="section-title">Danh sách hàng hóa (${receipt.items.length} mặt hàng)</div>
    <table>
      <thead>
        <tr>
          <th class="center" style="width:5%">STT</th>
          <th style="width:40%">Sản phẩm (SKU)</th>
          <th class="right" style="width:18%">Đơn giá</th>
          <th class="center" style="width:12%">Số lượng</th>
          <th class="right" style="width:25%">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
        <tr class="total-row">
          <td colspan="3" style="text-align:right;padding-right:12px;">Tổng tiền hàng:</td>
          <td class="center bold">${totalQuantity}</td>
          <td class="right total-amount">${fmt(receipt.totalPrice)}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="signatures">
    <div class="sig-box">
      <div class="sig-title">Nhà cung cấp / Người giao hàng</div>
      <div class="sig-sub">(Ký, ghi rõ họ tên)</div><br/><br/>
      <div class="sig-name">${receipt.supplier?.name ?? '..........................................'}</div>
    </div>
    <div class="sig-box">
      <div class="sig-title">Người nhận hàng</div>
      <div class="sig-sub">(Ký, ghi rõ họ tên)</div><br/><br/>
      <div class="sig-name">${receipt.createdBy.username}</div>
    </div>
  </div>
  <p class="note">Phiếu nhập kho là căn cứ để kiểm tra và đối chiếu hàng hóa nhập vào kho.<br/>In lúc: ${new Date().toLocaleString('vi-VN')}</p>
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

  // Open serial modal
  const handleViewSerials = (item: ImportDetailResponse) => {
    setSelectedItem(item);
    setOpenSerialModal(true);
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Status mapping
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; type: 'success' | 'warning' | 'error' | 'info' }> = {
      COMPLETED: { label: 'Hoàn thành', type: 'success' },
      PENDING: { label: 'Chờ xử lý', type: 'warning' },
      CANCELLED: { label: 'Đã hủy', type: 'error' },
    };
    return statusMap[status] || { label: status, type: 'info' };
  };

  // Calculate totals
  const calculateTotals = () => {
    if (!currentImportReceipt?.items) {
      return { totalQuantity: 0, totalAmount: 0 };
    }

    const totalQuantity = currentImportReceipt.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const totalAmount = currentImportReceipt.totalPrice;

    return { totalQuantity, totalAmount };
  };

  const { totalQuantity, totalAmount } = calculateTotals();

  if (!currentImportReceipt && !loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Không tìm thấy phiếu nhập kho</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mt: 2 }}
        >
          Quay lại
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Chi tiết Phiếu Nhập Kho"
        actions={[
          {
            label: 'In phiếu',
            icon: <PrintIcon />,
            onClick: handlePrint,
            variant: 'outlined',
          },
          {
            label: 'Quay lại',
            icon: <ArrowBackIcon />,
            onClick: () => router.back(),
            variant: 'outlined',
          },
        ]}
      />

      {loading && <LoadingOverlay open={loading} />}

      {currentImportReceipt && (
        <>
          {/* Header Information Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" gutterBottom>
                    Mã phiếu nhập
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                    {currentImportReceipt.code}
                  </Typography>
                </Box>
                <Box>
                  {currentImportReceipt.status && (() => {
                    const statusMap: Record<string, string> = {
                      COMPLETED: 'completed',
                      PENDING: 'pending',
                      CANCELLED: 'cancelled',
                    };
                    return (
                      <StatusChip
                        status={statusMap[currentImportReceipt.status] || currentImportReceipt.status}
                        size="medium"
                      />
                    );
                  })()}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Kho nhập
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {currentImportReceipt.warehouse.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({currentImportReceipt.warehouse.code})
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Nhà cung cấp
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {currentImportReceipt.supplier?.name || '-'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Người tạo
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {currentImportReceipt.createdBy.username}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Ngày tạo
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {format(new Date(currentImportReceipt.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </Typography>
                </Grid>

                {currentImportReceipt.note && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Ghi chú
                    </Typography>
                    <Typography variant="body1">
                      {currentImportReceipt.note}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Items Table Card */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Danh sách hàng hóa
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell width="5%" align="center">STT</TableCell>
                      <TableCell width="35%">Sản phẩm (SKU)</TableCell>
                      <TableCell width="15%" align="right">Đơn giá</TableCell>
                      <TableCell width="10%" align="right">Số lượng</TableCell>
                      <TableCell width="15%" align="right">Thành tiền</TableCell>
                      <TableCell width="20%" align="center">Serial</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentImportReceipt.items.map((item, index) => (
                      <TableRow key={item.id} hover>
                        <TableCell align="center">{index + 1}</TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {item.product.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.product.sku || 'N/A'}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatCurrency(item.unitPrice)}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={500}>
                            {item.quantity}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600} color="error.main">
                            {formatCurrency(item.amount)}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          {item.scannedSerials && item.scannedSerials.length > 0 ? (
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<QrCodeIcon />}
                              onClick={() => handleViewSerials(item)}
                            >
                              Xem danh sách ({item.scannedSerials.length})
                            </Button>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Footer Summary */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" fontWeight={500}>
                        Tổng số lượng:
                      </Typography>
                      <Chip
                        label={totalQuantity}
                        color="primary"
                        size="medium"
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" fontWeight={600}>
                        Tổng tiền hàng:
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color="error.main">
                        {formatCurrency(totalAmount)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Footer Actions */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                >
                  In phiếu nhập
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => router.back()}
                >
                  Quay lại
                </Button>
              </Box>
            </CardContent>
          </Card>
        </>
      )}

      {/* Serial List Modal */}
      {selectedItem && (
        <SerialListModal
          open={openSerialModal}
          onClose={() => {
            setOpenSerialModal(false);
            setSelectedItem(null);
          }}
          productName={selectedItem.product.name}
          serials={selectedItem.scannedSerials || []}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
