'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Alert,
  Box,
  Chip,
  Snackbar,
  Typography,
} from '@mui/material';
import {
  MenuBook as GuideIcon,
  Cached as RefreshIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  AssignmentTurnedIn as ReassignIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Column,
  DataTable,
  DataTableAction,
  FilterBar,
  LoadingOverlay,
  PageHeader,
  PermissionDeniedDialog,
  PermissionGuard,
  StatusChip,
} from '@libs/src/components/common';
import {
  TerminationConfirmDialog,
  TerminationDetailDialog,
  TerminationGuideDialog,
  TerminationReassignDialog,
  TerminationRestoreDialog,
  type TerminationRestoreFormState,
} from '@libs/src/components/termination-requests';
import { usePermissionGuard, usePermissions } from '@libs/src/hooks';
import { PERMISSIONS } from '@libs/shared/constants/permissions.constant';
import { TerminationStatus } from '@libs/shared/enums/termination-status.enum';
import { Status as EmployeeStatus } from '@libs/shared/enums/employee-status.enum';
import { UserStatus } from '@libs/shared/enums/user-status.enum';
import { PORTAL_PERMISSIONS } from '@libs/shared/constants/portal-permissions.constant';
import { CacheService } from '@libs/src/services/cache.service';
import { fetchCurrentUser } from '@libs/src/features/auth/auth.slice';
import { fetchRoleByCode } from '@libs/src/features/role/role.slice';
import { fetchUserById } from '@libs/src/features/user/user.slice';
import employeeService from '@libs/src/features/employee/employee.service';
import userService from '@libs/src/features/user/user.service';
import {
  approveTerminationRequest,
  clearError,
  fetchTerminationRequestById,
  fetchTerminationRequests,
  rejectTerminationRequest,
  restoreTerminationRequest,
  updateTerminationReassignStatus,
} from '@libs/src/features/termination-request/termination-request.slice';
import type { EmployeeResponse } from '@libs/shared/types/employees.type';
import type { PayslipResponse } from '@libs/shared/types/payslips.type';
import type {
  RestoreTerminationRequestDto,
  TerminationApproveResponse,
  TerminationRequestResponse,
} from '@libs/shared/types/termination-request.type';
import type { UserResponse } from '@libs/shared/types/users.type';

const statusColorMap: Record<TerminationStatus, 'warning' | 'success' | 'error'> = {
  [TerminationStatus.PENDING]: 'warning',
  [TerminationStatus.APPROVED]: 'success',
  [TerminationStatus.REJECTED]: 'error',
};

const initialRestoreForm: TerminationRestoreFormState = {
  forceRestore: false,
  restoreReason: '',
};

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

const normalizeErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const errObj = error as {
      message?: string;
      response?: { data?: { message?: string | string[] } };
    };

    if (Array.isArray(errObj.response?.data?.message)) {
      return errObj.response?.data?.message.join(', ');
    }
    if (typeof errObj.response?.data?.message === 'string') {
      return errObj.response?.data?.message;
    }
    if (typeof errObj.message === 'string') {
      return errObj.message;
    }
  }
  return fallback;
};

export default function HRTerminationsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.TERMINATION_REQUEST.VIEW} fallbackPath="/hr">
      <HRTerminationsPageContent />
    </PermissionGuard>
  );
}

function HRTerminationsPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { hasPermission } = usePermissions();
  const { guardFn, permissionDialogProps } = usePermissionGuard();

  const {
    terminationRequests,
    currentTerminationRequest,
    latestApproveResult,
    totalCount,
    loading,
    error,
    operationLoading,
    operationError,
  } = useSelector((state: RootState) => state.terminationRequest);

  const { user, isAuth, authChecked } = useSelector((state: RootState) => state.auth);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { currentRole } = useSelector((state: RootState) => state.role);

  const [openGuide, setOpenGuide] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openApprove, setOpenApprove] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [openReassign, setOpenReassign] = useState(false);
  const [openRestore, setOpenRestore] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState<TerminationRequestResponse | null>(null);
  const [selectedEmployeeUser, setSelectedEmployeeUser] = useState<UserResponse | null>(null);
  const [employeeUserLoading, setEmployeeUserLoading] = useState(false);

  const [reassignValue, setReassignValue] = useState(false);
  const [restoreForm, setRestoreForm] = useState<TerminationRestoreFormState>(initialRestoreForm);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterEmployeeName, setFilterEmployeeName] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const [payslipByRequestId, setPayslipByRequestId] = useState<Record<string, PayslipResponse>>({});

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserById(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (currentUser?.role?.role_code) {
      dispatch(fetchRoleByCode(currentUser.role.role_code));
    }
  }, [dispatch, currentUser?.role?.role_code]);

  const isHR =
    currentRole?.permissions?.some(
      (permission) => permission.permission_code === PORTAL_PERMISSIONS.HR,
    ) || false;

  useEffect(() => {
    if (!isAuth || !user || !isHR) return;

    dispatch(
      fetchTerminationRequests({
        status: filterStatus || undefined,
        employeeName: filterEmployeeName || undefined,
        page: page + 1,
        pageSize: rowsPerPage,
      }),
    );
  }, [
    dispatch,
    filterStatus,
    filterEmployeeName,
    isAuth,
    isHR,
    page,
    refreshCounter,
    rowsPerPage,
    user,
  ]);

  useEffect(() => {
    if (!selectedRequest) return;
    if (currentTerminationRequest?.id === selectedRequest.id) {
      setSelectedRequest(currentTerminationRequest);
    }
  }, [currentTerminationRequest, selectedRequest]);

  useEffect(() => {
    if (error || operationError) {
      setSnackbar({
        open: true,
        message: error || operationError || 'Đã xảy ra lỗi',
        severity: 'error',
      });
      dispatch(clearError());
    }
  }, [dispatch, error, operationError]);

  useEffect(() => {
    if (authChecked && !isAuth) {
      window.location.href = '/auth/login';
    }
  }, [authChecked, isAuth]);

  useEffect(() => {
    if (authChecked && isAuth && currentRole && !isHR) {
      window.location.href = '/portal-selection';
    }
  }, [authChecked, currentRole, isAuth, isHR]);

  const activePayslip = useMemo(() => {
    if (!selectedRequest) return null;
    const fromMap = payslipByRequestId[selectedRequest.id];
    if (fromMap) return fromMap;

    if (latestApproveResult?.terminationRequest.id === selectedRequest.id) {
      return latestApproveResult.payslip;
    }
    return null;
  }, [latestApproveResult, payslipByRequestId, selectedRequest]);

  const handleRefresh = async () => {
    await CacheService.refreshCache();
    setRefreshCounter((prev) => prev + 1);
  };

  const loadEmployeeUserStatus = async (userId?: string) => {
    if (!userId) {
      setSelectedEmployeeUser(null);
      return;
    }

    setEmployeeUserLoading(true);
    try {
      const userData = await userService.getUserById(userId);
      setSelectedEmployeeUser(userData);
    } catch {
      setSelectedEmployeeUser(null);
    } finally {
      setEmployeeUserLoading(false);
    }
  };

  const handleViewDetail = async (row: TerminationRequestResponse) => {
    setSelectedRequest(row);
    setOpenDetail(true);
    loadEmployeeUserStatus(row.employee.userId);

    try {
      const detail = await dispatch(fetchTerminationRequestById(row.id)).unwrap();
      setSelectedRequest(detail.terminationRequest);
      setPayslipByRequestId((prev) => ({
        ...prev,
        [detail.terminationRequest.id]: detail.payslip,
      }));
      loadEmployeeUserStatus(detail.terminationRequest.employee.userId);
    } catch {
      // keep latest row data as fallback
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      const result = (await dispatch(
        approveTerminationRequest(selectedRequest.id),
      ).unwrap()) as TerminationApproveResponse;

      setPayslipByRequestId((prev) => ({
        ...prev,
        [result.terminationRequest.id]: result.payslip,
      }));
      setSelectedRequest(result.terminationRequest);
      setOpenApprove(false);
      setOpenDetail(true);
      setRefreshCounter((prev) => prev + 1);
      loadEmployeeUserStatus(result.terminationRequest.employee.userId);

      setSnackbar({
        open: true,
        message: 'Duyệt yêu cầu sa thải thành công và đã cập nhật trạng thái nhân sự ngay trên UI',
        severity: 'success',
      });
    } catch (err: unknown) {
      setSnackbar({
        open: true,
        message: normalizeErrorMessage(err, 'Không thể duyệt yêu cầu sa thải'),
        severity: 'error',
      });
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      const result = await dispatch(rejectTerminationRequest(selectedRequest.id)).unwrap();
      setSelectedRequest(result);
      setOpenReject(false);
      setRefreshCounter((prev) => prev + 1);

      setSnackbar({
        open: true,
        message: 'Từ chối yêu cầu sa thải thành công',
        severity: 'success',
      });
    } catch (err: unknown) {
      setSnackbar({
        open: true,
        message: normalizeErrorMessage(err, 'Không thể từ chối yêu cầu sa thải'),
        severity: 'error',
      });
    }
  };

  const handleUpdateReassign = async () => {
    if (!selectedRequest) return;

    if (selectedRequest.status !== TerminationStatus.APPROVED) {
      setSnackbar({
        open: true,
        message: 'Chỉ có thể cập nhật bàn giao khi yêu cầu đã APPROVED',
        severity: 'error',
      });
      return;
    }

    try {
      const result = await dispatch(
        updateTerminationReassignStatus({
          id: selectedRequest.id,
          isReassigned: reassignValue,
        }),
      ).unwrap();

      setSelectedRequest(result);
      setOpenReassign(false);
      setRefreshCounter((prev) => prev + 1);

      setSnackbar({
        open: true,
        message: 'Cập nhật nghĩa vụ bàn giao thành công',
        severity: 'success',
      });
    } catch (err: unknown) {
      setSnackbar({
        open: true,
        message: normalizeErrorMessage(err, 'Không thể cập nhật nghĩa vụ bàn giao'),
        severity: 'error',
      });
    }
  };

  const handleRestore = async () => {
    if (!selectedRequest) return;

    if (selectedRequest.status !== TerminationStatus.APPROVED) {
      setSnackbar({
        open: true,
        message: 'Chỉ có thể restore khi yêu cầu đã APPROVED',
        severity: 'error',
      });
      return;
    }

    if (!selectedRequest.isReassigned && !restoreForm.forceRestore) {
      setSnackbar({
        open: true,
        message:
          'Không đủ nghĩa vụ để restore: nhân viên chưa hoàn tất bàn giao tài sản. Bật force restore nếu sa thải nhầm.',
        severity: 'error',
      });
      return;
    }

    if (restoreForm.forceRestore && !restoreForm.restoreReason.trim()) {
      setSnackbar({
        open: true,
        message: 'Vui lòng nhập lý do restore khi bật force restore',
        severity: 'error',
      });
      return;
    }

    const payload: RestoreTerminationRequestDto = {
      forceRestore: restoreForm.forceRestore || undefined,
      restoreReason: restoreForm.restoreReason.trim() || undefined,
    };

    try {
      const result = await dispatch(
        restoreTerminationRequest({ id: selectedRequest.id, data: payload }),
      ).unwrap();

      setSelectedRequest(result);
      setOpenRestore(false);
      setRestoreForm(initialRestoreForm);
      setRefreshCounter((prev) => prev + 1);
      loadEmployeeUserStatus(result.employee.userId);

      setSnackbar({
        open: true,
        message:
          'Restore thành công. Trạng thái nhân viên đã về ACTIVE, tài khoản đã mở truy cập và phiên bị khóa đã được gỡ.',
        severity: 'success',
      });
    } catch (err: unknown) {
      setSnackbar({
        open: true,
        message: normalizeErrorMessage(err, 'Không thể restore nhân viên'),
        severity: 'error',
      });
    }
  };

  const columns: Column<TerminationRequestResponse>[] = [
    {
      id: 'employee.fullName',
      label: 'Nhân viên',
      minWidth: 180,
      format: (_value: unknown, row) => (
        <Typography variant="body2" fontWeight={600}>
          {row.employee.fullName}
        </Typography>
      ),
    },
    {
      id: 'terminationDate',
      label: 'Ngày sa thải',
      minWidth: 130,
      format: (value) => <Typography variant="body2">{formatDate(value)}</Typography>,
    },
    {
      id: 'terminationReason',
      label: 'Lý do',
      minWidth: 220,
      format: (value) => (
        <Typography variant="body2" noWrap title={String(value || '')}>
          {String(value || '-')}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Trạng thái',
      minWidth: 120,
      align: 'center',
      format: (value: TerminationStatus) => (
        <Chip
          size="small"
          label={value}
          color={statusColorMap[value] || 'default'}
          sx={{ fontWeight: 700 }}
        />
      ),
    },
    {
      id: 'isReassigned',
      label: 'Đã bàn giao tài sản',
      minWidth: 170,
      align: 'center',
      format: (value: boolean) => (
        <StatusChip
          status={value ? 'success' : 'warning'}
          label={value ? 'Đã bàn giao' : 'Chưa bàn giao'}
          showIcon
        />
      ),
    },
    {
      id: 'terminatedBy.username',
      label: 'Người duyệt',
      minWidth: 140,
      format: (_value: unknown, row) => (
        <Typography variant="body2">{row.terminatedBy?.username || '-'}</Typography>
      ),
    },
    {
      id: 'terminatedAt',
      label: 'Thời điểm duyệt',
      minWidth: 170,
      format: (value) => <Typography variant="body2">{formatDateTime(value)}</Typography>,
    },
  ];

  const rowActions: DataTableAction<TerminationRequestResponse>[] = [
    {
      icon: <ApproveIcon />,
      label: 'Duyệt',
      color: 'success',
      onClick: guardFn(PERMISSIONS.TERMINATION_REQUEST.APPROVE, (row) => {
        setSelectedRequest(row);
        setOpenApprove(true);
      }),
      hidden: (row) =>
        !hasPermission(PERMISSIONS.TERMINATION_REQUEST.APPROVE) ||
        row.status !== TerminationStatus.PENDING,
    },
    {
      icon: <RejectIcon />,
      label: 'Từ chối',
      color: 'error',
      onClick: guardFn(PERMISSIONS.TERMINATION_REQUEST.APPROVE, (row) => {
        setSelectedRequest(row);
        setOpenReject(true);
      }),
      hidden: (row) =>
        !hasPermission(PERMISSIONS.TERMINATION_REQUEST.APPROVE) ||
        row.status !== TerminationStatus.PENDING,
    },
    {
      icon: <ReassignIcon />,
      label: 'Cập nhật bàn giao',
      color: 'info',
      onClick: guardFn(PERMISSIONS.TERMINATION_REQUEST.UPDATE, (row) => {
        setSelectedRequest(row);
        setReassignValue(!row.isReassigned);
        setOpenReassign(true);
      }),
      hidden: (row) =>
        !hasPermission(PERMISSIONS.TERMINATION_REQUEST.UPDATE) ||
        row.status !== TerminationStatus.APPROVED,
    },
    {
      icon: <RestoreIcon />,
      label: 'Restore',
      color: 'warning',
      onClick: guardFn(PERMISSIONS.TERMINATION_REQUEST.RESTORE, (row) => {
        setSelectedRequest(row);
        setRestoreForm(initialRestoreForm);
        setOpenRestore(true);
      }),
      hidden: (row) =>
        !hasPermission(PERMISSIONS.TERMINATION_REQUEST.RESTORE) ||
        row.status !== TerminationStatus.APPROVED,
    },
  ];

  if (!authChecked || !currentRole) {
    return <LoadingOverlay open={true} />;
  }

  if (!isHR) {
    return null;
  }

  const accountAccessLabel = (() => {
    if (employeeUserLoading) return 'Đang tải...';
    if (selectedEmployeeUser?.status === UserStatus.ACTIVE) return 'Đang mở truy cập';
    if (selectedEmployeeUser?.status === UserStatus.BANNED) return 'Đang khóa truy cập';
    if (selectedRequest?.employee.status === EmployeeStatus.TERMINATED) return 'Đang khóa truy cập';
    if (selectedRequest?.employee.status === EmployeeStatus.ACTIVE) return 'Đang mở truy cập';
    return 'Không xác định';
  })();

  const canRestoreWithoutForce = selectedRequest?.isReassigned ?? false;

  return (
    <Box>
      <LoadingOverlay open={loading && terminationRequests.length === 0} />

      <PageHeader
        title="Quản lý sa thải"
        subtitle="Theo dõi, duyệt và restore yêu cầu sa thải theo quyền"
        actions={[
          {
            label: 'Làm mới',
            onClick: handleRefresh,
            icon: <RefreshIcon />,
            variant: 'outlined',
            disabled: loading,
          },
          ...(hasPermission(PERMISSIONS.TERMINATION_REQUEST.VIEW)
            ? [
                {
                  label: 'Xem hướng dẫn',
                  onClick: () => setOpenGuide(true),
                  icon: <GuideIcon />,
                  variant: 'outlined' as const,
                },
              ]
            : []),
        ]}
      />

      <FilterBar
        filters={[
          {
            id: 'status',
            label: 'Trạng thái',
            type: 'select',
            value: filterStatus,
            options: [
              { value: '', label: 'Tất cả' },
              { value: TerminationStatus.PENDING, label: 'PENDING' },
              { value: TerminationStatus.APPROVED, label: 'APPROVED' },
              { value: TerminationStatus.REJECTED, label: 'REJECTED' },
            ],
          },
          {
            id: 'employeeName',
            label: 'Tên nhân viên',
            type: 'text',
            value: filterEmployeeName,
          },
        ]}
        onFilterChange={(filterId, value) => {
          if (filterId === 'status') setFilterStatus(value);
          if (filterId === 'employeeName') setFilterEmployeeName(value);
          setPage(0);
        }}
        onClearFilters={() => {
          setFilterStatus('');
          setFilterEmployeeName('');
          setPage(0);
        }}
      />

      <DataTable
        columns={columns}
        data={terminationRequests}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalCount}
        onPageChange={setPage}
        onRowsPerPageChange={(size) => {
          setRowsPerPage(size);
          setPage(0);
        }}
        actions={rowActions}
        onView={guardFn(PERMISSIONS.TERMINATION_REQUEST.VIEW, handleViewDetail)}
        emptyMessage="Chưa có yêu cầu sa thải nào"
        rowKey="id"
      />

      <TerminationGuideDialog open={openGuide} onClose={() => setOpenGuide(false)} />

      <TerminationDetailDialog
        open={openDetail}
        request={selectedRequest}
        payslip={activePayslip}
        selectedEmployeeUser={selectedEmployeeUser}
        employeeUserLoading={employeeUserLoading}
        accountAccessLabel={accountAccessLabel}
        canRestoreWithoutForce={canRestoreWithoutForce}
        onClose={() => {
          setOpenDetail(false);
          setSelectedRequest(null);
          setSelectedEmployeeUser(null);
        }}
      />

      <TerminationConfirmDialog
        open={openApprove}
        title="Xác nhận duyệt yêu cầu"
        description="Bạn có chắc chắn muốn duyệt yêu cầu sa thải này? Sau khi duyệt, hệ thống sẽ khóa tài khoản nhân viên và trả về bảng lương quyết toán."
        confirmLabel="Xác nhận duyệt"
        confirmColor="success"
        loading={operationLoading}
        onClose={() => setOpenApprove(false)}
        onConfirm={handleApprove}
      />

      <TerminationConfirmDialog
        open={openReject}
        title="Xác nhận từ chối"
        description="Bạn có chắc chắn muốn từ chối yêu cầu sa thải này?"
        confirmLabel="Xác nhận từ chối"
        confirmColor="error"
        loading={operationLoading}
        onClose={() => setOpenReject(false)}
        onConfirm={handleReject}
      />

      <TerminationReassignDialog
        open={openReassign}
        value={reassignValue}
        loading={operationLoading}
        onClose={() => setOpenReassign(false)}
        onValueChange={setReassignValue}
        onConfirm={handleUpdateReassign}
      />

      <TerminationRestoreDialog
        open={openRestore}
        form={restoreForm}
        canRestoreWithoutForce={canRestoreWithoutForce}
        loading={operationLoading}
        onClose={() => setOpenRestore(false)}
        onForceRestoreChange={(value) =>
          setRestoreForm((prev) => ({ ...prev, forceRestore: value }))
        }
        onRestoreReasonChange={(value) =>
          setRestoreForm((prev) => ({ ...prev, restoreReason: value }))
        }
        onConfirm={handleRestore}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <PermissionDeniedDialog {...permissionDialogProps} />
    </Box>
  );
}
