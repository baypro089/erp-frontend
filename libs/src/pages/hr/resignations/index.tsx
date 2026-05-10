'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Chip,
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
  PermissionGuard,
} from '@libs/src/components/common';
import {
  ResignationApproveModal,
  ResignationRejectModal,
} from '@libs/src/components/resignation-requests';
import {
  fetchResignationRequests,
  approveResignationRequest,
  rejectResignationRequest,
  clearError,
} from '@libs/src/features/resignation-request/resignation-request.slice';
import type {
  ResignationRequestResponse,
} from '@libs/shared/types/resignation-request.type';
import { ResignationStatus } from '@libs/shared/enums/resignation-status.enum';
import { fetchCurrentUser } from '@libs/src/features/auth/auth.slice';
import { fetchCurrentUserById } from '@libs/src/features/user/user.slice';
import { fetchRoleByCode } from '@libs/src/features/role/role.slice';
import { PORTAL_PERMISSIONS } from '@libs/shared/constants/portal-permissions.constant';
import { CacheService } from '@libs/src/services/cache.service';
import { usePermissionGuard } from '@libs/src/hooks';
import { PermissionDeniedDialog } from '@libs/src/components/common';
import { PERMISSIONS } from '@libs/shared/constants/permissions.constant';

export default function HRResignationPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.RESIGNATION_REQUEST.VIEW} fallbackPath="/hr">
      <HRResignationPageContent />
    </PermissionGuard>
  );
}

function HRResignationPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    resignationRequests,
    totalCount,
    totalPages,
    loading,
    error,
    operationLoading,
    operationError
  } = useSelector((state: RootState) => state.resignationRequest);

  // Get current auth user
  const { user, isAuth, authChecked } = useSelector((state: RootState) => state.auth);

  // Get detailed user info with employee and role
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { currentRole } = useSelector((state: RootState) => state.role);

  // Dialog states
  const [openApprove, setOpenApprove] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [selectedResignation, setSelectedResignation] = useState<ResignationRequestResponse | null>(null);

  // Tab state (0 = All, 1 = Pending)
  const [currentTab, setCurrentTab] = useState(1); // Default to Pending

  // Filter states
  const [filterStatus, setFilterStatus] = useState('');
  const [filterEmployeeName, setFilterEmployeeName] = useState('');

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

  const { guardFn, permissionDialogProps } = usePermissionGuard();

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
      dispatch(fetchCurrentUserById(user.id));
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

  // Reload resignation requests when filters or pagination changes
  useEffect(() => {
    // Only fetch if user is authenticated and has HR access
    if (!isAuth || !user || !isHR) {
      return;
    }

    let status: string | undefined;

    if (currentTab === 0) {
      // Tab "Tất cả đơn": Show all requests with optional filter
      if (filterStatus) {
        status = filterStatus;
      }
    } else if (currentTab === 1) {
      // Tab "Chờ duyệt": Show pending requests
      status = ResignationStatus.PENDING;
    }

    dispatch(
      fetchResignationRequests({
        status,
        employeeName: filterEmployeeName || undefined,
        page: page + 1,
        pageSize: rowsPerPage,
      })
    );
  }, [dispatch, filterStatus, filterEmployeeName, page, rowsPerPage, refreshCounter, currentTab, isHR, isAuth, user]);

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
  const columns: Column<ResignationRequestResponse>[] = [
    {
      id: 'employee.fullName',
      label: 'Nhân viên',
      minWidth: 180,
      format: (value: any, row: ResignationRequestResponse) => (
        <Typography variant="body2" fontWeight={600}>
          {row.employee.fullName}
        </Typography>
      ),
    },
    {
      id: 'summitDate',
      label: 'Ngày nộp đơn',
      minWidth: 120,
      format: (value: Date) => (
        <Typography variant="body2">
          {new Date(value).toLocaleDateString('vi-VN')}
        </Typography>
      ),
    },
    {
      id: 'desiredLastDay',
      label: 'Ngày mong muốn',
      minWidth: 130,
      format: (value: Date) => (
        <Typography variant="body2">
          {new Date(value).toLocaleDateString('vi-VN')}
        </Typography>
      ),
    },
    {
      id: 'approvedLastDay',
      label: 'Ngày đã duyệt',
      minWidth: 130,
      format: (value: Date | undefined) => (
        <Typography variant="body2">
          {value ? new Date(value).toLocaleDateString('vi-VN') : '-'}
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
      id: 'handoverNote',
      label: 'Link bàn giao',
      minWidth: 150,
      format: (value: string | undefined) => (
        value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'underline' }}
          >
            Xem tài liệu
          </a>
        ) : (
          <Typography variant="body2" color="text.disabled">
            -
          </Typography>
        )
      ),
    },
    {
      id: 'status',
      label: 'Trạng thái',
      minWidth: 130,
      align: 'center',
      format: (value: string) => {
        const statusMap: Record<string, { label: string; color: 'default' | 'warning' | 'success' | 'error' | 'info' }> = {
          [ResignationStatus.PENDING]: { label: 'Chờ duyệt', color: 'warning' },
          [ResignationStatus.APPROVED]: { label: 'Đã duyệt', color: 'success' },
          [ResignationStatus.REJECTED]: { label: 'Từ chối', color: 'error' },
          [ResignationStatus.COMPLETED]: { label: 'Hoàn tất', color: 'default' },
          [ResignationStatus.CANCELLED]: { label: 'Đã hủy', color: 'default' },
        };
        const status = statusMap[value] || { label: value, color: 'default' };
        return <Chip label={status.label} color={status.color} size="small" />;
      },
    },
  ];

  // Actions for approving/rejecting
  const approvalActions = [
    {
      icon: <ApproveIcon />,
      label: 'Duyệt',
      color: 'success' as const,
      onClick: guardFn<ResignationRequestResponse>(PERMISSIONS.RESIGNATION_REQUEST.APPROVE, (row) => {
        setSelectedResignation(row);
        setOpenApprove(true);
      }),
      hidden: (row: ResignationRequestResponse) => row.status !== ResignationStatus.PENDING,
    },
    {
      icon: <RejectIcon />,
      label: 'Từ chối',
      color: 'error' as const,
      onClick: guardFn<ResignationRequestResponse>(PERMISSIONS.RESIGNATION_REQUEST.APPROVE, (row) => {
        setSelectedResignation(row);
        setOpenReject(true);
      }),
      hidden: (row: ResignationRequestResponse) => row.status !== ResignationStatus.PENDING,
    },
  ];

  // Handlers
  const handleApprove = async (approvedLastDay: Date, hrNote?: string) => {
    if (!selectedResignation) return;

    try {
      await dispatch(
        approveResignationRequest({
          id: selectedResignation.id,
          approvedLastDay,
          hrNote,
        })
      ).unwrap();

      setSnackbar({
        open: true,
        message: 'Duyệt đơn nghỉ việc thành công',
        severity: 'success',
      });
      setOpenApprove(false);
      setSelectedResignation(null);
      setRefreshCounter(prev => prev + 1);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err || 'Không thể duyệt đơn',
        severity: 'error',
      });
    }
  };

  const handleReject = async (hrNote: string) => {
    if (!selectedResignation) return;

    try {
      await dispatch(
        rejectResignationRequest({
          id: selectedResignation.id,
          hrNote,
        })
      ).unwrap();

      setSnackbar({
        open: true,
        message: 'Từ chối đơn nghỉ việc thành công',
        severity: 'success',
      });
      setOpenReject(false);
      setSelectedResignation(null);
      setRefreshCounter(prev => prev + 1);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err || 'Không thể từ chối đơn',
        severity: 'error',
      });
    }
  };

  const handleRefresh = async () => {
    await CacheService.refreshCache();
    setRefreshCounter(prev => prev + 1);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setPage(0);
    // Clear filters when going to "Chờ duyệt" tab
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
      window.location.href = '/portal-selection';
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
      <LoadingOverlay open={loading && resignationRequests.length === 0} />

      <PageHeader
        title="Xử lý nghỉ việc"
        subtitle="Quản lý và xử lý các đơn xin nghỉ việc của nhân viên"
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
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Chờ duyệt
                {totalCount > 0 && currentTab === 1 && (
                  <Chip
                    label={totalCount}
                    size="small"
                    color="warning"
                    sx={{ height: 20, minWidth: 20 }}
                  />
                )}
              </Box>
            }
          />
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
                { value: ResignationStatus.PENDING, label: 'Chờ duyệt' },
                { value: ResignationStatus.APPROVED, label: 'Đã duyệt' },
                { value: ResignationStatus.REJECTED, label: 'Từ chối' },
                { value: ResignationStatus.COMPLETED, label: 'Hoàn tất' },
              ],
              value: filterStatus,
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
          }}
          onClearFilters={() => {
            setFilterStatus('');
            setFilterEmployeeName('');
          }}
        />
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={resignationRequests}
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
        emptyMessage="Chưa có đơn nghỉ việc nào"
        rowKey="id"
      />

      {/* Dialogs */}
      <ResignationApproveModal
        open={openApprove}
        onClose={() => {
          setOpenApprove(false);
          setSelectedResignation(null);
        }}
        onConfirm={handleApprove}
        resignation={selectedResignation}
        loading={operationLoading}
      />

      <ResignationRejectModal
        open={openReject}
        onClose={() => {
          setOpenReject(false);
          setSelectedResignation(null);
        }}
        onConfirm={handleReject}
        resignation={selectedResignation}
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

      <PermissionDeniedDialog {...permissionDialogProps} />
    </Box>
  );
}
