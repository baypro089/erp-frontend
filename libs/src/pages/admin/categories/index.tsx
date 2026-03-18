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
  Category as CategoryIcon,
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
import CategoryFormDialog from '@libs/src/components/categories/CategoryFormDialog';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategories,
  clearError,
} from '@libs/src/features/category/category.slice';
import type {
  CategoryResponse,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@libs/shared/types/category.type';
import { CacheService } from '@libs/src/services/cache.service';

export default function CategoriesPage() {
  return (
    <PermissionGuard 
      permission={PERMISSIONS.CATEGORY.VIEW}
      fallbackPath="/admin"
    >
      <CategoriesPageContent />
    </PermissionGuard>
  );
}

function CategoriesPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { guardAction, guardFn, permissionDialogProps } = usePermissionGuard();
  const { categories, loading, error, operationLoading, operationError } = useSelector(
    (state: RootState) => state.category
  );

  // Dialog states
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);
  const [selectedRows, setSelectedRows] = useState<CategoryResponse[]>([]);

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
    dispatch(fetchCategories({}));
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
  const columns: Column<CategoryResponse>[] = [
    {
      id: 'name',
      label: 'Tên danh mục',
      minWidth: 250,
      format: (value) => (
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'parent',
      label: 'Danh mục cha',
      minWidth: 200,
      format: (value) => {
        const parent = value as CategoryResponse['parent'];
        return parent ? (
          <Typography variant="body2" color="text.secondary">
            {parent.name}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.disabled" fontStyle="italic">
            Cấp gốc
          </Typography>
        );
      },
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
    setSelectedCategory(null);
    setOpenForm(true);
  };

  const handleEdit = (row: CategoryResponse) => {
    setSelectedCategory(row);
    setOpenForm(true);
  };

  const handleDelete = (row: CategoryResponse) => {
    setSelectedCategory(row);
    setSelectedRows([row]);
    setOpenDelete(true);
  };

  const handleBulkDelete = () => {
    if (selectedRows.length > 0) {
      setOpenDelete(true);
    }
  };

  const handleFormSubmit = async (
    data: CreateCategoryDto | UpdateCategoryDto,
    isEdit: boolean
  ) => {
    try {
      if (isEdit && selectedCategory) {
        // Update
        await dispatch(updateCategory({ id: selectedCategory.id, data: data as UpdateCategoryDto })).unwrap();
        setSnackbar({
          open: true,
          message: 'Cập nhật danh mục thành công',
          severity: 'success',
        });
      } else {
        // Create
        await dispatch(createCategory(data as CreateCategoryDto)).unwrap();
        setSnackbar({
          open: true,
          message: 'Tạo danh mục thành công',
          severity: 'success',
        });
      }
      setOpenForm(false);
      dispatch(fetchCategories({}));
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const ids = selectedRows.map((r) => r.id);
      await dispatch(deleteCategories(ids)).unwrap();
      setSnackbar({
        open: true,
        message: `Đã xóa thành công ${ids.length} danh mục`,
        severity: 'success',
      });
      setOpenDelete(false);
      setSelectedRows([]);
      dispatch(fetchCategories({}));
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  const handleRefresh = async () => {
    await CacheService.refreshCache();
    dispatch(fetchCategories({}));
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
  const filteredCategories = categories.filter((cat) => {
    const matchName =
      searchName === '' || cat.name.toLowerCase().includes(searchName.toLowerCase());
    return matchName;
  });

  const activeFiltersCount = searchName ? 1 : 0;

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title="Quản lý danh mục"
        subtitle="Quản lý danh mục sản phẩm và cấu trúc phân cấp"
        breadcrumbs={[
          { label: 'Danh mục', icon: <CategoryIcon fontSize="small" /> },
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
            onClick: guardAction(PERMISSIONS.CATEGORY.DELETE, handleBulkDelete),
            variant: 'outlined',
            color: 'error',
            disabled: selectedRows.length === 0,
            hidden: selectedRows.length === 0,
          },
          {
            label: 'Thêm danh mục',
            onClick: guardAction(PERMISSIONS.CATEGORY.CREATE, handleAdd),
            icon: <AddIcon />,
            variant: 'contained',
          },
        ]}
        tags={[{ label: `${filteredCategories.length} Tổng` }]}
      />

      {/* Filter Bar */}
      <FilterBar
        searchFields={[
          {
            id: 'name',
            label: 'Tên danh mục',
            placeholder: 'Tìm theo tên danh mục...',
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
        data={filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={filteredCategories.length}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setPage(0);
        }}
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onEdit={guardFn(PERMISSIONS.CATEGORY.UPDATE, handleEdit)}
        onDelete={guardFn(PERMISSIONS.CATEGORY.DELETE, handleDelete)}
        rowKey="id"
        emptyMessage="Không tìm thấy danh mục nào"
      />

      {/* Category Form Dialog */}
      <CategoryFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        selectedCategory={selectedCategory}
        categories={categories}
        loading={operationLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDeleteConfirm}
        title={`Xóa ${selectedRows.length} danh mục`}
        message={
          selectedRows.length === 1
            ? `Bạn có chắc chắn muốn xóa danh mục "${selectedRows[0]?.name}"?`
            : `Bạn có chắc chắn muốn xóa ${selectedRows.length} danh mục?`
        }
        loading={operationLoading}
      />

      {/* Loading Overlay */}
      <LoadingOverlay open={loading && categories.length === 0} message="Đang tải danh sách danh mục..." />

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
