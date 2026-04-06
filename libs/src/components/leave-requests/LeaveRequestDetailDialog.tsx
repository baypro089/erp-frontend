'use client';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Stack,
    Typography,
    Chip,
    Link,
    Divider,
} from '@mui/material';
import type { ReactNode } from 'react';
import { LeaveRequestStatus, LeaveRequestType } from '@libs/shared/enums/leave-request-status.enum';
import type { LeaveRequestResponse } from '@libs/shared/types/leave-requests.type';

interface LeaveRequestDetailDialogProps {
    open: boolean;
    onClose: () => void;
    leaveRequest: LeaveRequestResponse | null;
}

const leaveTypeLabels: Record<LeaveRequestType, string> = {
    [LeaveRequestType.ANNUAL]: 'Phép năm',
    [LeaveRequestType.SICK]: 'Nghỉ ốm',
    [LeaveRequestType.UNPAID]: 'Không lương',
    [LeaveRequestType.MATERNITY]: 'Nghỉ thai sản',
    [LeaveRequestType.OTHER]: 'Khác',
};

const leaveStatusLabels: Record<LeaveRequestStatus, string> = {
    [LeaveRequestStatus.PENDING]: 'Chờ duyệt',
    [LeaveRequestStatus.APPROVED]: 'Đã duyệt',
    [LeaveRequestStatus.REJECTED]: 'Từ chối',
    [LeaveRequestStatus.CANCELLED]: 'Đã hủy',
};

const DATE_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'UTC',
});

function formatDate(value?: Date | string) {
    if (!value) {
        return '-';
    }
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return DATE_FORMATTER.format(date);
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
    return (
        <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
                {value}
            </Typography>
        </Stack>
    );
}

export default function LeaveRequestDetailDialog({
    open,
    onClose,
    leaveRequest,
}: LeaveRequestDetailDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Chi tiết đơn nghỉ phép</DialogTitle>
            <DialogContent dividers>
                {!leaveRequest ? (
                    <Typography variant="body2" color="text.secondary">
                        Không có dữ liệu đơn nghỉ phép.
                    </Typography>
                ) : (
                    <Stack spacing={2}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <InfoRow label="Nhân viên" value={leaveRequest.employee.fullName} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <InfoRow label="Mã nhân viên" value={leaveRequest.employee.employeeCode || '-'} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <InfoRow
                                    label="Loại nghỉ"
                                    value={leaveTypeLabels[leaveRequest.type] || leaveRequest.type}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <InfoRow
                                    label="Trạng thái"
                                    value={<Chip size="small" label={leaveStatusLabels[leaveRequest.status] || leaveRequest.status} />}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <InfoRow label="Ngày bắt đầu" value={formatDate(leaveRequest.startDate)} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <InfoRow label="Ngày kết thúc" value={formatDate(leaveRequest.endDate)} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <InfoRow label="Số ngày nghỉ" value={`${leaveRequest.duration} ngày`} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <InfoRow
                                    label="BHXH"
                                    value={
                                        leaveRequest.type === LeaveRequestType.SICK
                                            ? leaveRequest.isBhxhClaimed
                                                ? 'Đã duyệt BHXH'
                                                : 'Chưa duyệt BHXH'
                                            : 'Không áp dụng'
                                    }
                                />
                            </Grid>
                        </Grid>

                        <Divider />

                        <InfoRow label="Lý do" value={leaveRequest.reason || '-'} />

                        {leaveRequest.rejectionReason && (
                            <InfoRow label="Lý do từ chối" value={leaveRequest.rejectionReason} />
                        )}

                        <InfoRow
                            label="Tài liệu đính kèm"
                            value={
                                leaveRequest.documentUrl ? (
                                    <Link href={leaveRequest.documentUrl} target="_blank" rel="noopener noreferrer">
                                        Xem tài liệu
                                    </Link>
                                ) : (
                                    'Không có'
                                )
                            }
                        />

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <InfoRow label="Ngày tạo" value={formatDate(leaveRequest.createdAt)} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <InfoRow label="Cập nhật lần cuối" value={formatDate(leaveRequest.updatedAt)} />
                            </Grid>
                        </Grid>
                    </Stack>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">
                    Đóng
                </Button>
            </DialogActions>
        </Dialog>
    );
}