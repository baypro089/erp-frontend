'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  Chip,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
  DeleteSweep as DeleteSweepIcon,
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
import EmployeeFormDialog from '@libs/src/components/employees/EmployeeFormDialog';
import DeletedEmployeesDialog from '@libs/src/components/employees/DeletedEmployeesDialog';
import {
  fetchEmployeesWithOptional,
  createEmployee,
  clearError,
} from '@libs/src/features/employee/employee.slice';
import { fetchDepartments } from '@libs/src/features/department/department.slice';
import { fetchPositions } from '@libs/src/features/position/position.slice';
import type {
  EmployeeTableResponse,
  CreateEmployeeDto,
} from '@libs/shared/types/employees.type';
import { Status } from '@libs/shared/enums/employee-status.enum';
import { Level } from '@libs/shared/enums/level.enum';
import { CacheService } from '@libs/src/services/cache.service';
import { usePermissionGuard } from '@libs/src/hooks';
import { PermissionDeniedDialog } from '@libs/src/components/common';
import { PERMISSIONS } from '@libs/shared/constants/permissions.constant';

export default function EmployeesPage() {
  return (
    <PermissionGuard 
      permission={PERMISSIONS.EMPLOYEE.VIEW}
      fallbackPath="/admin"
    >
      <EmployeesPageContent />
    </PermissionGuard>
  );
}

function EmployeesPageContent() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { employees, currentEmployee, totalCount, totalPages, loading, error, operationLoading, operationError } =
    useSelector((state: RootState) => state.employee);
  const { departments } = useSelector((state: RootState) => state.department);
  const { positions } = useSelector((state: RootState) => state.position);

  // Dialog states
  const [openForm, setOpenForm] = useState(false);
  const [openDeletedDialog, setOpenDeletedDialog] = useState(false);

  // Filter states
  const [searchFullName, setSearchFullName] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

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

  const { guardAction, permissionDialogProps } = usePermissionGuard();

  // Load data on mount
  useEffect(() => {
    dispatch(fetchDepartments({}));
    dispatch(fetchPositions({}));
  }, [dispatch]);

  // Reload employees when filters or pagination changes
  useEffect(() => {
    const departmentId = filterDepartment
      ? departments.find((d) => d.name === filterDepartment)?.id
      : undefined;
    const positionId = filterPosition
      ? positions.find((p) => p.name === filterPosition)?.id
      : undefined;

    dispatch(
      fetchEmployeesWithOptional({
        fullName: searchFullName || undefined,
        departmentId,
        positionId,
        status: filterStatus || undefined,
        level: filterLevel || undefined,
        page: page + 1, // API uses 1-based pagination
        pageSize: rowsPerPage,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, searchFullName, filterDepartment, filterPosition, filterStatus, filterLevel, page, rowsPerPage, refreshCounter]);

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
  const columns: Column<EmployeeTableResponse>[] = [
    {
      id: 'employeeCode',
      label: 'Mã nhân viên',
      minWidth: 140,
      format: (value) => (
        <Typography variant="body2" fontWeight={500} color="primary">
          {value}
        </Typography>
      ),
    },
    {
      id: 'fullName',
      label: 'Họ và tên',
      minWidth: 200,
      format: (value) => (
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'departmentName',
      label: 'Phòng ban',
      minWidth: 150,
      format: (value) => (
        <Chip label={value} size="small" variant="outlined" color="primary" />
      ),
    },
    {
      id: 'positionName',
      label: 'Chức vụ',
      minWidth: 150,
      format: (value) => (
        <Chip label={value} size="small" variant="outlined" color="secondary" />
      ),
    },
    {
      id: 'startDate',
      label: 'Ngày vào làm',
      minWidth: 120,
      format: (value) => {
        const date = new Date(value as Date);
        return (
          <Typography variant="body2" color="text.secondary">
            {date.toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Typography>
        );
      },
    },
    {
      id: 'status',
      label: 'Trạng thái',
      minWidth: 120,
      align: 'center',
      format: (value) => {
        const statusMap: Record<Status, 'active' | 'pending' | 'maternity' | 'resigned' | 'probation'> = {
          [Status.ACTIVE]: 'active',
          [Status.DRAFT]: 'pending',
          [Status.MATERNITY_LEAVE]: 'maternity',
          [Status.RESIGNED]: 'resigned',
          [Status.PROBATION]: 'probation',
          [Status.TERMINATED]: 'resigned',
        };
        return <StatusChip status={statusMap[value as Status]} showIcon />;
      },
    },
    {
      id: 'createdAt',
      label: 'Ngày tạo',
      minWidth: 120,
      format: (value) => {
        const date = new Date(value as Date);
        return (
          <Typography variant="body2" color="text.secondary">
            {date.toLocaleDateString('vi-VN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Typography>
        );
      },
    },
  ];

  // Handlers
  const handleAdd = () => {
    setOpenForm(true);
  };

  const handleViewDetail = (row: EmployeeTableResponse) => {
    router.push(`/hr/employees/${row.id}`);
  };

  const handleFormSubmit = async (data: CreateEmployeeDto) => {
    try {
      await dispatch(createEmployee(data)).unwrap();
      setSnackbar({
        open: true,
        message: 'Tạo nhân viên thành công',
        severity: 'success',
      });
      setOpenForm(false);
      setRefreshCounter(prev => prev + 1);
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  const handleRefresh = async () => {
    await CacheService.refreshCache();
    setRefreshCounter(prev => prev + 1);
    setSnackbar({
      open: true,
      message: 'Dữ liệu đã được làm mới',
      severity: 'success',
    });
  };

  const handleClearFilters = () => {
    setSearchFullName('');
    setFilterDepartment('');
    setFilterPosition('');
    setFilterStatus('');
    setFilterLevel('');
    setPage(0);
  };

  const activeFiltersCount =
    (searchFullName ? 1 : 0) +
    (filterDepartment ? 1 : 0) +
    (filterPosition ? 1 : 0) +
    (filterStatus ? 1 : 0) +
    (filterLevel ? 1 : 0);

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title="Quản lý nhân viên"
        subtitle="Quản lý nhân sự và thông tin nhân viên"
        breadcrumbs={[
          { label: 'Quản trị', href: '/' },
          { label: 'Nhân viên', icon: <PeopleIcon fontSize="small" /> },
        ]}
        actions={[
          {
            label: 'Làm mới',
            onClick: handleRefresh,
            icon: <RefreshIcon />,
            variant: 'outlined',
          },
          {
            label: 'Nhân viên đã xóa',
            onClick: () => setOpenDeletedDialog(true),
            icon: <DeleteSweepIcon />,
            variant: 'outlined',
            color: 'warning',
          },
          {
            label: 'Thêm nhân viên',
            onClick: guardAction(PERMISSIONS.EMPLOYEE.CREATE, handleAdd),
            icon: <AddIcon />,
            variant: 'contained',
          },
        ]}
        tags={[{ label: `${totalCount} Tổng` }]}
      />

      {/* Filter Bar */}
      <FilterBar
        searchFields={[
          {
            id: 'fullName',
            label: 'Tên nhân viên',
            placeholder: 'Tìm theo tên nhân viên...',
            value: searchFullName,
          },
          
        ]}
        onSearchChange={(fieldId, value) => {
          if (fieldId === 'fullName') setSearchFullName(value);
        }}
        filters={[
          {
            id: 'department',
            label: 'Phòng ban',
            type: 'select',
            options: departments.map((d) => ({ value: d.name, label: d.name })),
            value: filterDepartment,
          },
          {
            id: 'position',
            label: 'Chức vụ',
            type: 'select',
            options: positions.map((p) => ({ value: p.name, label: p.name })),
            value: filterPosition,
          },
          {
            id: 'status',
            label: 'Trạng thái',
            type: 'select',
            options: [
              { value: Status.ACTIVE, label: 'Đang làm việc' },
              { value: Status.DRAFT, label: 'Nháp' },
              { value: Status.MATERNITY_LEAVE, label: 'Nghỉ thai sản' },
              { value: Status.RESIGNED, label: 'Đã nghỉ việc' },
              { value: Status.PROBATION, label: 'Thử việc' },
            ],
            value: filterStatus,
          },
          {
            id: 'level',
            label: 'Cấp bậc',
            type: 'select',
            options: Object.values(Level).map((l) => ({ value: l, label: l })),
            value: filterLevel,
          },
        ]}
        onFilterChange={(filterId, value) => {
          if (filterId === 'department') setFilterDepartment(value);
          if (filterId === 'position') setFilterPosition(value);
          if (filterId === 'status') setFilterStatus(value);
          if (filterId === 'level') setFilterLevel(value);
        }}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalCount}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setPage(0);
        }}
        onView={handleViewDetail}
        rowKey="id"
        emptyMessage="Không tìm thấy nhân viên nào"
      />

      {/* Employee Form Dialog */}
      <EmployeeFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        loading={operationLoading}
      />

      {/* Deleted Employees Dialog */}
      <DeletedEmployeesDialog
        open={openDeletedDialog}
        onClose={() => setOpenDeletedDialog(false)}
      />

      {/* Loading Overlay */}
      <LoadingOverlay open={loading && employees.length === 0} message="Đang tải danh sách nhân viên..." />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <PermissionDeniedDialog {...permissionDialogProps} />
    </Box>
  );
}
