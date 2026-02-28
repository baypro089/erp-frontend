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
import { PageHeader, LoadingOverlay, StatusChip } from '@libs/src/components/common';
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
    window.print();
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
