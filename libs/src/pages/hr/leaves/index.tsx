'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  DataTable,
  PageHeader,
  FilterBar,
  StatusChip,
  LoadingOverlay,
  Column,
} from '@libs/src/components/common';
import {
  LeaveBalanceCard,
  LeaveRequestFormDialog,
} from '@libs/src/components/leave-requests';
import {
  fetchMyLeaveRequests,
  createLeaveRequest,
  clearError,
} from '@libs/src/features/leave-request/leave-request.slice';
import type {
  LeaveRequestResponse,
  LeaveRequestCreateDto,
} from '@libs/shared/types/leave-requests.type';
import { LeaveRequestStatus, LeaveRequestType } from '@libs/shared/enums/leave-request-status.enum';
import { fetchCurrentUser } from '@libs/src/features/auth/auth.slice';
import { fetchUserById } from '@libs/src/features/user/user.slice';
import { fetchRoleByCode } from '@libs/src/features/role/role.slice';
import { CacheService } from '@libs/src/services/cache.service';

export default function LeavesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    leaveRequests,
    totalCount,
    loading,
    error,
    operationLoading,
    operationError
  } = useSelector((state: RootState) => state.leaveRequest);

  // Get current auth user
  const { user, isAuth, authChecked } = useSelector((state: RootState) => state.auth);
  
  // Get detailed user info with employee and role
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { currentRole } = useSelector((state: RootState) => state.role);

  // Dialog states
  const [openForm, setOpenForm] = useState(false);

  // Filter states
  const [filterStatus, setFilterStatus] = useState('');

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Load current user and role data on mount
  useEffect(() => {
    const loadUserData = async () => {
      await dispatch(fetchCurrentUser());
    };
    loadUserData();
  }, [dispatch]);

  // Load detailed user info when auth user is available
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserById(user.id));
    }
  }, [dispatch, user?.id]);

  // Load role details when current user is available
  useEffect(() => {
    if (currentUser?.role?.role_code) {
      dispatch(fetchRoleByCode(currentUser.role.role_code));
    }
  }, [dispatch, currentUser?.role?.role_code]);

  // Calculate leave balance from employee data
  const leaveBalance = {
    total: currentUser?.employee?.totalAnnualLeave || 0,
    remaining: currentUser?.employee ? 
      (currentUser.employee.totalAnnualLeave - currentUser.employee.usedAnnualLeave) : 0,
  };

  // Reload leave requests when filters or pagination changes
  useEffect(() => {
    // Only fetch if user is authenticated
    if (!isAuth || !user) {
      return;
    }

    let status: LeaveRequestStatus | undefined;
    if (filterStatus) {
      status = filterStatus as LeaveRequestStatus;
    }

    // Fetch only current user's leave requests using /my endpoint
    dispatch(
      fetchMyLeaveRequests({
        status,
        page: page + 1,
        pageSize: rowsPerPage,
      })
    );
  }, [dispatch, filterStatus, page, rowsPerPage, refreshCounter, isAuth, user]);

  // Handle errors
  useEffect(() => {
    if (error || operationError) {
      setSnackbar({
        open: true,
        message: error || operationError || 'Đã xảy ra lỗi',
        severity: 'error',
      });
      dispatch(clearError());
    }
  }, [error, operationError, dispatch]);

  // Define table columns
  const columns: Column<LeaveRequestResponse>[] = [
    {
      id: 'type',
      label: 'Loại nghỉ',
      minWidth: 120,
      format: (value: LeaveRequestType) => {
        const typeLabels: Record<LeaveRequestType, string> = {
          [LeaveRequestType.ANNUAL]: 'Phép năm',
          [LeaveRequestType.SICK]: 'Nghỉ ốm',
          [LeaveRequestType.UNPAID]: 'Không lương',
          [LeaveRequestType.MATERNITY]: 'Thai sản',
          [LeaveRequestType.OTHER]: 'Khác',
        };
        return (
          <Typography variant="body2">
            {typeLabels[value]}
          </Typography>
        );
      },
    },
    {
      id: 'startDate',
      label: 'Ngày bắt đầu',
      minWidth: 120,
      format: (value: Date) => (
        <Typography variant="body2">
          {new Date(value).toLocaleDateString('vi-VN')}
        </Typography>
      ),
    },
    {
      id: 'endDate',
      label: 'Ngày kết thúc',
      minWidth: 120,
      format: (value: Date) => (
        <Typography variant="body2">
          {new Date(value).toLocaleDateString('vi-VN')}
        </Typography>
      ),
    },
    {
      id: 'duration',
      label: 'Số ngày',
      minWidth: 80,
      align: 'center',
      format: (value: number) => (
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'reason',
      label: 'Lý do',
      minWidth: 200,
      format: (value: string) => (
        <Typography variant="body2" noWrap title={value}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Trạng thái',
      minWidth: 130,
      align: 'center',
      format: (value: LeaveRequestStatus) => (
        <StatusChip status={value.toLowerCase()} />
      ),
    },
    {
      id: 'createdAt',
      label: 'Ngày tạo',
      minWidth: 120,
      format: (value: Date) => (
        <Typography variant="body2">
          {new Date(value).toLocaleDateString('vi-VN')}
        </Typography>
      ),
    },
  ];

  // Handlers
  const handleCreateLeaveRequest = async (data: LeaveRequestCreateDto) => {
    try {
      await dispatch(createLeaveRequest(data)).unwrap();
      setSnackbar({
        open: true,
        message: 'Gửi đơn nghỉ phép thành công',
        severity: 'success',
      });
      setOpenForm(false);
      setRefreshCounter(prev => prev + 1);
      // Refresh user data to update leave balance
      if (user?.id) {
        dispatch(fetchUserById(user.id));
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err || 'Không thể gửi đơn nghỉ phép',
        severity: 'error',
      });
    }
  };

  const handleRefresh = async () => {
    await CacheService.refreshCache();
    setRefreshCounter(prev => prev + 1);
    if (user?.id) {
      dispatch(fetchUserById(user.id));
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authChecked && !isAuth) {
      window.location.href = '/auth/login';
    }
  }, [authChecked, isAuth]);

  // Show loading while checking authentication
  if (!authChecked) {
    return <LoadingOverlay open={true} />;
  }

  return (
    <Box>
      <LoadingOverlay open={loading && leaveRequests.length === 0} />

      <PageHeader
        title="Đơn xin nghỉ phép của tôi"
        subtitle="Xem lịch sử và tạo đơn xin nghỉ phép"
        actions={[
          {
            label: 'Làm mới',
            onClick: handleRefresh,
            icon: <RefreshIcon />,
            variant: 'outlined',
            disabled: loading,
          },
          {
            label: 'Xin nghỉ phép',
            onClick: () => setOpenForm(true),
            icon: <AddIcon />,
            variant: 'contained' as const,
          },
        ]}
      />

      {/* Show balance for all users */}
      <Box sx={{ mb: 3, maxWidth: 400 }}>
        <LeaveBalanceCard
          remaining={leaveBalance.remaining}
          total={leaveBalance.total}
          loading={loading}
        />
      </Box>

      {/* Filters */}
      <FilterBar
        filters={[
          {
            id: 'status',
            label: 'Trạng thái',
            type: 'select',
            options: [
              { value: '', label: 'Tất cả' },
              { value: 'PENDING', label: 'Chờ duyệt' },
              { value: 'APPROVED', label: 'Đã duyệt' },
              { value: 'REJECTED', label: 'Từ chối' },
            ],
            value: filterStatus,
          },
        ]}
        onFilterChange={(filterId, value) => {
          if (filterId === 'status') setFilterStatus(value);
        }}
        onClearFilters={() => setFilterStatus('')}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={leaveRequests}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalCount}
        onPageChange={setPage}
        onRowsPerPageChange={(size) => {
          setRowsPerPage(size);
          setPage(0);
        }}
        emptyMessage="Chưa có đơn nghỉ phép nào"
        rowKey="id"
      />

      {/* Dialogs */}
      <LeaveRequestFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleCreateLeaveRequest}
        loading={operationLoading}
        employeeId={currentUser?.employee?.id}
        leaveBalance={leaveBalance.remaining}
      />

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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
