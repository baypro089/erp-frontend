'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  LocalOffer as BrandIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  DataTable,
  DeleteConfirmDialog,
  PageHeader,
  FilterBar,
  LoadingOverlay,
  Column,
  PermissionDeniedDialog,
  PermissionGuard,
} from '@libs/src/components/common';
import { usePermissionGuard } from '@libs/src/hooks';
import { PERMISSIONS } from '@libs/shared/constants/permissions.constant';
import BrandFormDialog from '@libs/src/components/brands/BrandFormDialog';
import {
  fetchBrands,
  createBrand,
  updateBrand,
  deleteBrands,
  clearError,
} from '@libs/src/features/brand/brand.slice';
import type {
  BrandResponse,
  CreateBrandDto,
  UpdateBrandDto,
} from '@libs/shared/types/brand.type';
import { CacheService } from '@libs/src/services/cache.service';

export default function BrandsPage() {
  return (
    <PermissionGuard 
      permission={PERMISSIONS.BRAND.VIEW}
      fallbackPath="/admin"
    >
      <BrandsPageContent />
    </PermissionGuard>
  );
}

function BrandsPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { guardAction, guardFn, permissionDialogProps } = usePermissionGuard();
  const { brands, loading, error, operationLoading, operationError } = useSelector(
    (state: RootState) => state.brand
  );

  // Dialog states
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<BrandResponse | null>(null);
  const [selectedRows, setSelectedRows] = useState<BrandResponse[]>([]);

  // Filter states
  const [searchName, setSearchName] = useState('');

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Load data on mount
  useEffect(() => {
    dispatch(fetchBrands({}));
  }, [dispatch]);

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
  const columns: Column<BrandResponse>[] = [
    {
      id: 'name',
      label: 'Tên thương hiệu',
      minWidth: 300,
      format: (value) => (
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'isActive',
      label: 'Trạng thái',
      minWidth: 120,
      align: 'center',
      format: (value) => (
        <Chip
          label={value ? 'Hoạt động' : 'Ngừng hoạt động'}
          color={value ? 'success' : 'default'}
          size="small"
          sx={{ minWidth: 80 }}
        />
      ),
    },
    {
      id: 'createdAt',
      label: 'Ngày tạo',
      minWidth: 180,
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
      id: 'updatedAt',
      label: 'Cập nhật lúc',
      minWidth: 180,
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
  ];

  // Handlers
  const handleAdd = () => {
    setSelectedBrand(null);
    setOpenForm(true);
  };

  const handleEdit = (row: BrandResponse) => {
    setSelectedBrand(row);
    setOpenForm(true);
  };

  const handleDelete = (row: BrandResponse) => {
    setSelectedBrand(row);
    setSelectedRows([row]);
    setOpenDelete(true);
  };

  const handleBulkDelete = () => {
    if (selectedRows.length > 0) {
      setOpenDelete(true);
    }
  };

  const handleFormSubmit = async (
    data: CreateBrandDto | UpdateBrandDto,
    isEdit: boolean
  ) => {
    try {
      if (isEdit && selectedBrand) {
        // Update
        await dispatch(updateBrand({ id: selectedBrand.id, data: data as UpdateBrandDto })).unwrap();
        setSnackbar({
          open: true,
          message: 'Cập nhật thương hiệu thành công',
          severity: 'success',
        });
      } else {
        // Create
        await dispatch(createBrand(data as CreateBrandDto)).unwrap();
        setSnackbar({
          open: true,
          message: 'Tạo thương hiệu thành công',
          severity: 'success',
        });
      }
      setOpenForm(false);
      dispatch(fetchBrands({}));
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const ids = selectedRows.map((r) => r.id);
      await dispatch(deleteBrands(ids)).unwrap();
      setSnackbar({
        open: true,
        message: `Đã xóa thành công ${ids.length} thương hiệu`,
        severity: 'success',
      });
      setOpenDelete(false);
      setSelectedRows([]);
      dispatch(fetchBrands({}));
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  const handleRefresh = async () => {
    await CacheService.refreshCache();
    dispatch(fetchBrands({}));
    setSnackbar({
      open: true,
      message: 'Dữ liệu đã được làm mới',
      severity: 'success',
    });
  };

  const handleClearFilters = () => {
    setSearchName('');
  };

  // Filter data
  const filteredBrands = brands.filter((brand) => {
    const matchName =
      searchName === '' || brand.name.toLowerCase().includes(searchName.toLowerCase());
    return matchName;
  });

  const activeFiltersCount = searchName ? 1 : 0;

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title="Quản lý thương hiệu"
        subtitle="Quản lý thương hiệu và nhà sản xuất sản phẩm"
        breadcrumbs={[
          { label: 'Thương hiệu', icon: <BrandIcon fontSize="small" /> },
        ]}
        actions={[
          {
            label: 'Làm mới',
            onClick: handleRefresh,
            icon: <RefreshIcon />,
            variant: 'outlined',
          },
          {
            label: 'Xóa mục đã chọn',
            onClick: guardAction(PERMISSIONS.BRAND.DELETE, handleBulkDelete),
            variant: 'outlined',
            color: 'error',
            disabled: selectedRows.length === 0,
            hidden: selectedRows.length === 0,
          },
          {
            label: 'Thêm thương hiệu',
            onClick: guardAction(PERMISSIONS.BRAND.CREATE, handleAdd),
            icon: <AddIcon />,
            variant: 'contained',
          },
        ]}
        tags={[{ label: `${filteredBrands.length} Tổng` }]}
      />

      {/* Filter Bar */}
      <FilterBar
        searchFields={[
          {
            id: 'name',
            label: 'Tên thương hiệu',
            placeholder: 'Tìm theo tên thương hiệu...',
            value: searchName,
          },
        ]}
        onSearchChange={(fieldId, value) => {
          if (fieldId === 'name') setSearchName(value);
        }}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredBrands.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={filteredBrands.length}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setPage(0);
        }}
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onEdit={guardFn(PERMISSIONS.BRAND.UPDATE, handleEdit)}
        onDelete={guardFn(PERMISSIONS.BRAND.DELETE, handleDelete)}
        rowKey="id"
        emptyMessage="Không tìm thấy thương hiệu nào"
      />

      {/* Brand Form Dialog */}
      <BrandFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        selectedBrand={selectedBrand}
        loading={operationLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDeleteConfirm}
        title={`Xóa ${selectedRows.length} thương hiệu`}
        message={
          selectedRows.length === 1
            ? `Bạn có chắc chắn muốn xóa thương hiệu "${selectedRows[0]?.name}"?`
            : `Bạn có chắc chắn muốn xóa ${selectedRows.length} thương hiệu?`
        }
        loading={operationLoading}
      />

      {/* Loading Overlay */}
      <LoadingOverlay open={loading && brands.length === 0} message="Đang tải danh sách thương hiệu..." />

      <PermissionDeniedDialog {...permissionDialogProps} />

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
    </Box>
  );
}
