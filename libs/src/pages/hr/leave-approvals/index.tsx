'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
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
  ApproveRejectDialog,
} from '@libs/src/components/leave-requests';
import {
  fetchLeaveRequests,
  updateLeaveRequestStatus,
  clearError,
} from '@libs/src/features/leave-request/leave-request.slice';
import type {
  LeaveRequestResponse,
} from '@libs/shared/types/leave-requests.type';
import { LeaveRequestStatus, LeaveRequestType } from '@libs/shared/enums/leave-request-status.enum';
import { fetchCurrentUser } from '@libs/src/features/auth/auth.slice';
import { fetchUserById } from '@libs/src/features/user/user.slice';
import { fetchRoleByCode } from '@libs/src/features/role/role.slice';
import { PORTAL_PERMISSIONS } from '@libs/shared/constants/portal-permissions.constant';

export default function LeaveApprovalsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    leaveRequests,
    totalCount,
    totalPages,
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
  const [openApproveReject, setOpenApproveReject] = useState(false);
  const [approveRejectAction, setApproveRejectAction] = useState<'approve' | 'reject'>('approve');
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequestResponse | null>(null);

  // Tab state (0 = All, 1 = Pending)
  const [currentTab, setCurrentTab] = useState(0);

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

  // Check if user has HR portal access
  const isHR = currentRole?.permissions?.some(
    (permission) => permission.permission_code === PORTAL_PERMISSIONS.HR
  ) || false;

  // Reload leave requests when filters or pagination changes
  useEffect(() => {
    // Only fetch if user is authenticated and has HR access
    if (!isAuth || !user || !isHR) {
      return;
    }

    let status: LeaveRequestStatus | undefined;

    if (currentTab === 0) {
      // Tab "Tất cả đơn": Show all requests with optional filter
      if (filterStatus) {
        status = filterStatus as LeaveRequestStatus;
      }
    } else if (currentTab === 1) {
      // Tab "Chờ duyệt": Show pending requests
      status = LeaveRequestStatus.PENDING;
    }

    dispatch(
      fetchLeaveRequests({
        status,
        page: page + 1,
        pageSize: rowsPerPage,
      })
    );
  }, [dispatch, filterStatus, page, rowsPerPage, refreshCounter, currentTab, isHR, isAuth, user]);

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
      id: 'employee.fullName',
      label: 'Nhân viên',
      minWidth: 180,
      format: (value: any, row: LeaveRequestResponse) => (
        <Typography variant="body2" fontWeight={600}>
          {row.employee.fullName}
        </Typography>
      ),
    },
    {
      id: 'type',
      label: 'Loại nghỉ',
      minWidth: 120,
      format: (value: LeaveRequestType) => {
        const typeLabels: Record<LeaveRequestType, string> = {
          [LeaveRequestType.ANNUAL]: 'Phép năm',
          [LeaveRequestType.SICK]: 'Nghỉ ốm',
          [LeaveRequestType.UNPAID]: 'Không lương',
          [LeaveRequestType.MATERNITY]: 'Nghỉ thai sản',
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

  // Actions for approving/rejecting
  const approvalActions = [
    {
      icon: <ApproveIcon />,
      label: 'Duyệt',
      color: 'success' as const,
      onClick: (row: LeaveRequestResponse) => {
        setSelectedLeaveRequest(row);
        setApproveRejectAction('approve');
        setOpenApproveReject(true);
      },
      hidden: (row: LeaveRequestResponse) => row.status !== LeaveRequestStatus.PENDING,
    },
    {
      icon: <RejectIcon />,
      label: 'Từ chối',
      color: 'error' as const,
      onClick: (row: LeaveRequestResponse) => {
        setSelectedLeaveRequest(row);
        setApproveRejectAction('reject');
        setOpenApproveReject(true);
      },
      hidden: (row: LeaveRequestResponse) => row.status !== LeaveRequestStatus.PENDING,
    },
  ];

  // Handlers
  const handleApproveReject = async (status: LeaveRequestStatus, reason?: string) => {
    if (!selectedLeaveRequest) return;

    try {
      await dispatch(
        updateLeaveRequestStatus({
          id: selectedLeaveRequest.id,
          status,
          reason,
        })
      ).unwrap();

      setSnackbar({
        open: true,
        message: status === LeaveRequestStatus.APPROVED
          ? 'Duyệt đơn thành công'
          : 'Từ chối đơn thành công',
        severity: 'success',
      });
      setOpenApproveReject(false);
      setSelectedLeaveRequest(null);
      setRefreshCounter(prev => prev + 1);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err || 'Không thể cập nhật trạng thái',
        severity: 'error',
      });
    }
  };

  const handleRefresh = () => {
    setRefreshCounter(prev => prev + 1);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setPage(0);
    // Clear filter when going to "Chờ duyệt" tab
    if (newValue === 1) {
      setFilterStatus('');
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authChecked && !isAuth) {
      window.location.href = '/auth/login';
    }
  }, [authChecked, isAuth]);

  // Redirect if not HR
  useEffect(() => {
    if (authChecked && isAuth && currentRole && !isHR) {
      window.location.href = '/hr/leaves';
    }
  }, [authChecked, isAuth, isHR, currentRole]);

  // Show loading while checking authentication
  if (!authChecked || !currentRole) {
    return <LoadingOverlay open={true} />;
  }

  // If not HR, don't render
  if (!isHR) {
    return null;
  }

  return (
    <Box>
      <LoadingOverlay open={loading && leaveRequests.length === 0} />

      <PageHeader
        title="Duyệt đơn nghỉ phép"
        subtitle="Xem và duyệt đơn nghỉ phép của nhân viên"
        actions={[
          {
            label: 'Làm mới',
            onClick: handleRefresh,
            icon: <RefreshIcon />,
            variant: 'outlined',
            disabled: loading,
          },
        ]}
      />

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Tất cả đơn" />
          <Tab label="Chờ duyệt" />
        </Tabs>
      </Box>

      {/* Filters - Show on "Tất cả đơn" tab */}
      {currentTab === 0 && (
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
      )}

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
        actions={approvalActions}
        emptyMessage="Chưa có đơn nghỉ phép nào"
        rowKey="id"
      />

      {/* Dialogs */}
      <ApproveRejectDialog
        open={openApproveReject}
        onClose={() => {
          setOpenApproveReject(false);
          setSelectedLeaveRequest(null);
        }}
        onConfirm={handleApproveReject}
        action={approveRejectAction}
        leaveRequest={selectedLeaveRequest}
        loading={operationLoading}
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
