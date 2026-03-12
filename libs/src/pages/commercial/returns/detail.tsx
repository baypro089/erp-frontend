'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Paper,
} from '@mui/material';
import {
  Print as PrintIcon,
  ArrowBack as BackIcon,
  AssignmentReturn as ReturnIcon,
  CheckCircle as CheckIcon,
  InfoOutlined as InfoIcon,
  Warehouse as WarehouseIcon,
} from '@mui/icons-material';
import { PageHeader, LoadingOverlay, StatusChip, PermissionGuard } from '@libs/src/components/common';
import { PERMISSIONS } from '@libs/shared/constants/permissions.constant';
import { fetchReturnRequestById } from '@libs/src/features/return-request/return-request.slice';
import { ReturnStatus } from '@libs/shared/enums/return-status.enum';

const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  [ReturnStatus.PENDING]: 'Chờ xử lý',
  [ReturnStatus.COMPLETED]: 'Hoàn tất',
  [ReturnStatus.REJECTED]: 'Từ chối',
};

const RETURN_STATUS_COLOR: Record<ReturnStatus, 'warning' | 'success' | 'error'> = {
  [ReturnStatus.PENDING]: 'warning',
  [ReturnStatus.COMPLETED]: 'success',
  [ReturnStatus.REJECTED]: 'error',
};

interface ReturnDetailPageProps {
  id: string;
}

export default function ReturnDetailPage({ id }: ReturnDetailPageProps) {
  return (
    <PermissionGuard 
      permission={PERMISSIONS.RETURN_REQUEST.VIEW}
      fallbackPath="/commercial/returns"
    >
      <ReturnDetailPageContent id={id} />
    </PermissionGuard>
  );
}

function ReturnDetailPageContent({ id }: ReturnDetailPageProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { currentReturnRequest, loading } = useSelector(
    (state: RootState) => state.returnRequest
  );

  useEffect(() => {
    if (id) dispatch(fetchReturnRequestById(id));
  }, [id, dispatch]);

  const rma = currentReturnRequest;

  if (loading) {
    return <LoadingOverlay open />;
  }

  if (!rma) {
    return (
      <Box p={4}>
        <Alert severity="error">
          Không tìm thấy phiếu trả hàng.{' '}
          <Button size="small" onClick={() => router.push('/commercial/returns')}>
            Quay lại danh sách
          </Button>
        </Alert>
      </Box>
    );
  }

  const handlePrint = () => {
    if (!rma) return;

    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const formatDate = (date: string | Date) =>
      new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

    const statusLabel =
      rma.status === ReturnStatus.COMPLETED
        ? 'Hoàn tất'
        : rma.status === ReturnStatus.REJECTED
          ? 'Từ chối'
          : 'Chờ xử lý';

    const itemRows =
      (rma.items ?? [])
        .map((item) => {
          const serials =
            item.returnedSerials && item.returnedSerials.length > 0
              ? item.returnedSerials.join(', ')
              : `SL: ${item.quantity}`;
          const total = (item.refundPrice ?? 0) * (item.quantity ?? 1);
          return `
          <tr>
            <td>${item.product?.name ?? '—'}</td>
            <td class="center">${serials}</td>
            <td class="right">${formatCurrency(item.refundPrice ?? 0)}</td>
            <td class="right bold">${formatCurrency(total)}</td>
          </tr>`;
        })
        .join('') || '<tr><td colspan="4" class="center">Không có mặt hàng</td></tr>';

    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Phiếu RMA ${rma.code}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; font-size: 13px; color: #111; background: #fff; }
    .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 16mm 14mm; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1565c0; padding-bottom: 12px; margin-bottom: 12px; }
    .company h1 { font-size: 20px; color: #1565c0; font-weight: 800; letter-spacing: 1px; }
    .company p { font-size: 11px; color: #555; margin-top: 2px; }
    .doc-info { text-align: right; }
    .doc-info .rma-code { font-size: 22px; font-weight: 800; color: #e65100; }
    .doc-info .doc-title { font-size: 11px; color: #777; text-transform: uppercase; letter-spacing: 1px; }
    .doc-info .doc-date { font-size: 11px; color: #555; margin-top: 3px; }

    /* Status badge */
    .status-row { text-align: center; margin: 10px 0 14px; }
    .status-badge { display: inline-block; padding: 4px 20px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .status-completed { background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; }
    .status-pending   { background: #fff8e1; color: #e65100; border: 1px solid #ffe082; }
    .status-rejected  { background: #ffebee; color: #c62828; border: 1px solid #ef9a9a; }

    /* Info grid */
    .section { margin-bottom: 14px; }
    .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #1565c0; letter-spacing: 0.5px; border-left: 4px solid #1565c0; padding-left: 8px; margin-bottom: 8px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px 16px; }
    .info-grid.two { grid-template-columns: 1fr 1fr; }
    .info-item .label { font-size: 10px; color: #777; text-transform: uppercase; letter-spacing: 0.4px; }
    .info-item .value { font-size: 13px; font-weight: 600; color: #111; margin-top: 1px; }
    .info-item .value.highlight { color: #e65100; font-size: 15px; }
    .info-item .value.link { color: #1565c0; }

    /* Reason */
    .reason-box { background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 6px; padding: 10px 12px; font-size: 12px; color: #333; line-height: 1.6; }

    /* Table */
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #1565c0; color: #fff; padding: 7px 8px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; }
    th.center, td.center { text-align: center; }
    th.right,  td.right  { text-align: right; }
    td { padding: 7px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
    tr:nth-child(even) td { background: #fafafa; }
    .total-row td { background: #e3f2fd !important; font-weight: 700; font-size: 13px; border-top: 2px solid #1565c0; }
    .total-row .amount { color: #c62828; font-size: 15px; }
    .bold { font-weight: 700; }

    /* Signatures */
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 24px; }
    .sig-box { border: 1px dashed #bbb; border-radius: 6px; padding: 12px; text-align: center; min-height: 90px; }
    .sig-box .sig-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #555; margin-bottom: 4px; }
    .sig-box .sig-sub { font-size: 10px; color: #999; }
    .sig-box .sig-name { font-size: 12px; font-weight: 600; color: #222; margin-top: 4px; }

    /* Note */
    .note { font-size: 10.5px; color: #777; font-style: italic; margin-top: 14px; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }

    /* Divider */
    .divider { border: none; border-top: 1px solid #e0e0e0; margin: 12px 0; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 10mm 12mm; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="company">
      <h1>ERP COMMERCIAL</h1>
      <p>Hệ thống quản lý thương mại</p>
      <p style="margin-top:6px; font-size:12px; color:#333;">
        <strong>PHIẾU NHẬN TRẢ HÀNG / BẢO HÀNH</strong>
      </p>
    </div>
    <div class="doc-info">
      <div class="doc-title">Mã phiếu RMA</div>
      <div class="rma-code">${rma.code}</div>
      <div class="doc-date">Ngày lập: ${formatDate(rma.createdAt)}</div>
    </div>
  </div>

  <!-- Status -->
  <div class="status-row">
    <span class="status-badge status-${rma.status === ReturnStatus.COMPLETED ? 'completed' : rma.status === ReturnStatus.REJECTED ? 'rejected' : 'pending'}">
      Trạng thái: ${statusLabel}
    </span>
  </div>

  <!-- Thông tin phiếu -->
  <div class="section">
    <div class="section-title">Thông tin phiếu RMA</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="label">Mã phiếu RMA</div>
        <div class="value link">${rma.code}</div>
      </div>
      <div class="info-item">
        <div class="label">Đơn hàng gốc</div>
        <div class="value link">${rma.order?.code ?? '—'}</div>
      </div>
      <div class="info-item">
        <div class="label">Ngày tạo phiếu</div>
        <div class="value">${formatDate(rma.createdAt)}</div>
      </div>
      <div class="info-item">
        <div class="label">Khách hàng</div>
        <div class="value">${rma.customer?.fullName ?? '—'}</div>
      </div>
      <div class="info-item">
        <div class="label">Số điện thoại</div>
        <div class="value">${rma.customer?.phoneNumber ?? '—'}</div>
      </div>
      <div class="info-item">
        <div class="label">Nhân viên xử lý</div>
        <div class="value">${rma.creator?.employee?.fullName ?? rma.creator?.username ?? '—'}</div>
      </div>
    </div>
  </div>

  <hr class="divider" />

  <!-- Kho & lý do -->
  <div class="section">
    <div class="section-title">Kho tiếp nhận &amp; Lý do</div>
    <div class="info-grid two" style="margin-bottom:8px">
      <div class="info-item">
        <div class="label">Kho tiếp nhận</div>
        <div class="value">${rma.warehouse?.name ?? '—'}</div>
      </div>
      <div class="info-item">
        <div class="label">Tiền hoàn trả khách</div>
        <div class="value highlight">${formatCurrency(rma.refundAmount ?? 0)}</div>
      </div>
    </div>
    <div class="label" style="font-size:10px;color:#777;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px;">Lý do trả hàng</div>
    <div class="reason-box">${rma.reason ?? '—'}</div>
  </div>

  <hr class="divider" />

  <!-- Danh sách hàng hóa -->
  <div class="section">
    <div class="section-title">Danh sách hàng hóa trả (${rma.items?.length ?? 0} mặt hàng)</div>
    <table>
      <thead>
        <tr>
          <th style="width:38%">Tên sản phẩm</th>
          <th class="center" style="width:26%">Serial / Số lượng</th>
          <th class="right" style="width:18%">Đơn giá hoàn</th>
          <th class="right" style="width:18%">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
        <tr class="total-row">
          <td colspan="3" style="text-align:right; padding-right:12px;">Tổng tiền hoàn lại:</td>
          <td class="right amount">${formatCurrency(rma.refundAmount ?? 0)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Chữ ký -->
  <div class="signatures">
    <div class="sig-box">
      <div class="sig-title">Khách hàng xác nhận</div>
      <div class="sig-sub">(Ký, ghi rõ họ tên)</div>
      <br /><br />
      <div class="sig-name">${rma.customer?.fullName ?? '..........................................'}</div>
    </div>
    <div class="sig-box">
      <div class="sig-title">Nhân viên tiếp nhận</div>
      <div class="sig-sub">(Ký, ghi rõ họ tên)</div>
      <br /><br />
      <div class="sig-name">${rma.creator?.employee?.fullName ?? rma.creator?.username ?? '..........................................'}</div>
    </div>
  </div>

  <p class="note">
    Phiếu này là bằng chứng xác nhận việc tiếp nhận hàng trả / bảo hành. Xin vui lòng giữ lại để đối chiếu khi cần.<br/>
    In lúc: ${new Date().toLocaleString('vi-VN')}
  </p>

</div>
<script>
  window.onload = function () { window.print(); };
</script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  return (
    <Box>
      <PageHeader
        title={`Phiếu RMA: ${rma.code}`}
        subtitle="Chi tiết phiếu trả hàng / bảo hành"
        breadcrumbs={[
          { label: 'Thương mại', href: '/commercial/dashboards' },
          { label: 'Trả hàng', href: '/commercial/returns' },
          { label: rma.code },
        ]}
        actions={[
          {
            label: 'Quay lại',
            onClick: () => router.push('/commercial/returns'),
            icon: <BackIcon />,
            variant: 'outlined',
          },
          {
            label: 'In Phiếu Nhận Bảo Hành',
            onClick: handlePrint,
            icon: <PrintIcon />,
            variant: 'contained',
            color: 'primary',
          },
        ]}
      />

      <Stack spacing={3}>
        {/* Trạng thái banner */}
        {rma.status === ReturnStatus.COMPLETED && (
          <Alert
            severity="success"
            icon={<CheckIcon />}
            sx={{ fontWeight: 600 }}
          >
            Phiếu đã được xử lý hoàn tất — hàng đã nhập kho và hoàn tiền cho khách.
          </Alert>
        )}

        {/* ── Card thông tin phiếu ── */}
        <Card variant="outlined">
          <CardHeader
            avatar={<InfoIcon color="primary" />}
            title={
              <Typography fontWeight={700} variant="h6">
                Thông tin Phiếu RMA
              </Typography>
            }
            action={
              <Chip
                label={RETURN_STATUS_LABELS[rma.status] ?? rma.status}
                color={RETURN_STATUS_COLOR[rma.status] ?? 'default'}
              />
            }
            sx={{ pb: 0 }}
          />
          <Divider />
          <CardContent>
            <Box
              display="grid"
              gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }}
              gap={2.5}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">Mã phiếu RMA</Typography>
                <Typography variant="body1" fontWeight={700} color="primary">{rma.code}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Đơn hàng gốc</Typography>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  sx={{ cursor: 'pointer', color: 'primary.main' }}
                  onClick={() => router.push(`/commercial/orders`)}
                >
                  {rma.order?.code ?? '—'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Ngày tạo phiếu</Typography>
                <Typography variant="body1">
                  {new Date(rma.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Khách hàng</Typography>
                <Typography variant="body1" fontWeight={600}>{rma.customer?.fullName ?? '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Số điện thoại</Typography>
                <Typography variant="body1">{rma.customer?.phoneNumber ?? '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Nhân viên xử lý</Typography>
                <Typography variant="body1">{rma.creator?.employee?.fullName ?? rma.creator?.username ?? '—'}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* ── Card kho & lý do ── */}
        <Card variant="outlined">
          <CardHeader
            avatar={<WarehouseIcon color="warning" />}
            title={
              <Typography fontWeight={700} variant="h6">
                Kho Tiếp Nhận & Lý Do
              </Typography>
            }
            sx={{ pb: 0 }}
          />
          <Divider />
          <CardContent>
            <Box
              display="grid"
              gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
              gap={2.5}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">Kho tiếp nhận</Typography>
                <Typography variant="body1" fontWeight={600}>{rma.warehouse?.name ?? '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Tiền hoàn trả khách</Typography>
                <Typography variant="h6" fontWeight={700} color="error.main">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(rma.refundAmount ?? 0)}
                </Typography>
              </Box>
              <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                <Typography variant="caption" color="text.secondary">Lý do trả hàng</Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2">{rma.reason}</Typography>
                </Paper>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* ── Card danh sách hàng trả ── */}
        <Card variant="outlined">
          <CardHeader
            avatar={<ReturnIcon color="error" />}
            title={
              <Typography fontWeight={700} variant="h6">
                Danh sách Hàng hóa Trả ({rma.items?.length ?? 0} mặt hàng)
              </Typography>
            }
            sx={{ pb: 0 }}
          />
          <Divider />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell>Sản phẩm</TableCell>
                  <TableCell align="center">Serial / Số lượng</TableCell>
                  <TableCell align="right">Đơn giá hoàn</TableCell>
                  <TableCell align="right">Thành tiền</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rma.items ?? []).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {item.product?.name ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {item.returnedSerials && item.returnedSerials.length > 0 ? (
                        <Box display="flex" gap={0.5} flexWrap="wrap" justifyContent="center">
                          {item.returnedSerials.map((s) => (
                            <Chip key={s} label={s} size="small" color="info" />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2">{item.quantity}</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(item.refundPrice ?? 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format((item.refundPrice ?? 0) * (item.quantity ?? 1))}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Tổng */}
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell colSpan={3} align="right">
                    <Typography variant="body2" fontWeight={700}>
                      Tổng tiền hoàn lại:
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight={700} color="error.main">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(rma.refundAmount ?? 0)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* ── Nút in phiếu ── */}
        <Box
          sx={{
            p: 3,
            border: '2px dashed',
            borderColor: 'primary.main',
            borderRadius: 2,
            textAlign: 'center',
            bgcolor: 'primary.50',
          }}
        >
          <Typography variant="body2" color="text.secondary" mb={1.5}>
            Vui lòng in phiếu và yêu cầu khách hàng ký xác nhận trước khi bàn giao sản phẩm
          </Typography>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            size="large"
          >
            In Phiếu Nhận Bảo Hành / Trả Hàng
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
