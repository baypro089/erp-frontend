import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { StatusChip } from '@libs/src/components/common';
import { TerminationStatus } from '@libs/shared/enums/termination-status.enum';
import type { PayslipResponse } from '@libs/shared/types/payslips.type';
import type { TerminationRequestResponse } from '@libs/shared/types/termination-request.type';
import type { UserResponse } from '@libs/shared/types/users.type';

interface TerminationDetailDialogProps {
  open: boolean;
  request: TerminationRequestResponse | null;
  payslip: PayslipResponse | null;
  selectedEmployeeUser: UserResponse | null;
  employeeUserLoading: boolean;
  accountAccessLabel: string;
  canRestoreWithoutForce: boolean;
  onClose: () => void;
}

const formatDate = (value?: Date | string | null): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('vi-VN');
};

const formatDateTime = (value?: Date | string | null): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('vi-VN');
};

const statusColorMap: Record<TerminationStatus, 'warning' | 'success' | 'error'> = {
  [TerminationStatus.PENDING]: 'warning',
  [TerminationStatus.APPROVED]: 'success',
  [TerminationStatus.REJECTED]: 'error',
};

export default function TerminationDetailDialog({
  open,
  request,
  payslip,
  selectedEmployeeUser,
  employeeUserLoading,
  accountAccessLabel,
  canRestoreWithoutForce,
  onClose,
}: TerminationDetailDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Chi tiết yêu cầu sa thải</DialogTitle>
      <DialogContent dividers>
        {!request ? (
          <Typography variant="body2" color="text.secondary">
            Không có dữ liệu
          </Typography>
        ) : (
          <Stack spacing={2}>
            <Card variant="outlined">
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Nhân viên
                    </Typography>
                    <Typography variant="subtitle2">{request.employee.fullName}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Trạng thái yêu cầu
                    </Typography>
                    <Chip
                      size="small"
                      label={request.status}
                      color={statusColorMap[request.status as TerminationStatus] || 'default'}
                      sx={{ fontWeight: 700 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Ngày sa thải
                    </Typography>
                    <Typography variant="subtitle2">{formatDate(request.terminationDate)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tài liệu
                    </Typography>
                    {request.document ? (
                      <Link href={request.document} target="_blank" rel="noopener noreferrer">
                        {request.document}
                      </Link>
                    ) : (
                      <Typography variant="subtitle2">-</Typography>
                    )}
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="body2" color="text.secondary">
                      Lý do
                    </Typography>
                    <Typography variant="subtitle2">{request.terminationReason}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Nghĩa vụ trước restore
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Trạng thái bàn giao tài sản
                  </Typography>
                  <StatusChip
                    status={request.isReassigned ? 'success' : 'warning'}
                    label={request.isReassigned ? 'Đã bàn giao' : 'Chưa bàn giao'}
                  />

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Trạng thái bảng lương tháng sa thải
                  </Typography>
                  {payslip ? (
                    <StatusChip
                      status={payslip.isPaid ? 'success' : 'warning'}
                      label={payslip.isPaid ? 'Đã thanh toán quyết toán' : 'Chưa thanh toán quyết toán'}
                    />
                  ) : (
                    <StatusChip status="warning" label="Chưa có dữ liệu bảng lương quyết toán" />
                  )}

                  <Alert severity={canRestoreWithoutForce ? 'success' : 'warning'}>
                    {canRestoreWithoutForce
                      ? 'Đủ nghĩa vụ để restore thông thường.'
                      : 'Chưa đủ nghĩa vụ restore: cần bàn giao tài sản hoặc dùng force restore có lý do.'}
                  </Alert>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Trạng thái tài khoản
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Trạng thái nhân viên
                    </Typography>
                    <Typography variant="subtitle2">{request.employee.status}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Trạng thái user
                    </Typography>
                    <Typography variant="subtitle2">
                      {employeeUserLoading ? 'Đang tải...' : selectedEmployeeUser?.status || 'Không xác định'}
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="body2" color="text.secondary">
                      Trạng thái truy cập
                    </Typography>
                    <Typography variant="subtitle2">{accountAccessLabel}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {payslip && (
              <Card variant="outlined">
                <CardContent>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    spacing={1}
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="subtitle1" fontWeight={700}>
                      Bảng lương quyết toán do sa thải
                    </Typography>
                    <Chip color="info" label="Termination Settlement Payslip" size="small" />
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Tháng / Năm
                      </Typography>
                      <Typography variant="subtitle2">
                        {String(payslip.month).padStart(2, '0')}/{payslip.year}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Công chuẩn / Công thực tế
                      </Typography>
                      <Typography variant="subtitle2">
                        {payslip.standardWorkDays} / {payslip.actualWorkDays}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Trạng thái thanh toán
                      </Typography>
                      <StatusChip
                        status={payslip.isPaid ? 'success' : 'warning'}
                        label={payslip.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Lương cơ bản
                      </Typography>
                      <Typography variant="subtitle2">{payslip.baseSalary.toLocaleString('vi-VN')} VND</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Lương thực nhận
                      </Typography>
                      <Typography variant="subtitle2" color="error.main" fontWeight={700}>
                        {payslip.finalSalary.toLocaleString('vi-VN')} VND
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Chi tiết phiếu lương
                      </Typography>
                      <Link href="/hr/payroll">Xem chi tiết phiếu lương</Link>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Lịch sử xử lý / Audit
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    • Tạo yêu cầu: {formatDateTime(request.createdAt)} | Người thao tác: {request.employee.fullName}
                  </Typography>
                  <Typography variant="body2">
                    • Duyệt yêu cầu: {formatDateTime(request.terminatedAt)} | Người thao tác:{' '}
                    {request.terminatedBy?.username || '-'}
                  </Typography>
                  <Typography variant="body2">
                    • Cập nhật gần nhất: {formatDateTime(request.updatedAt)} | Người thao tác: Hệ thống
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
