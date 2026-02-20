'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
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
  Inventory as ProductIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  DataTable,
  DeleteConfirmDialog,
  PageHeader,
  FilterBar,
  LoadingOverlay,
  Column,
} from '@libs/src/components/common';
import {
  fetchProducts,
  deleteProducts,
  clearError,
} from '@libs/src/features/product/product.slice';
import type {
  ProductTableResponse,
} from '@libs/shared/types/product.type';
import { fetchBrands } from '@libs/src/features/brand/brand.slice';
import { fetchCategories } from '@libs/src/features/category/category.slice';

export default function ProductsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { products, loading, error, operationLoading, operationError } =
    useSelector((state: RootState) => state.product);
  const { brands } = useSelector((state: RootState) => state.brand);
  const { categories } = useSelector((state: RootState) => state.category);

  // Dialog states
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedRows, setSelectedRows] = useState<ProductTableResponse[]>([]);

  // Filter states
  const [searchSku, setSearchSku] = useState('');
  const [searchName, setSearchName] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

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
    dispatch(fetchProducts({}));
    dispatch(fetchBrands({}));
    dispatch(fetchCategories({}));
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (error || operationError) {
      setSnackbar({
        open: true,
        message: error || operationError || 'An error occurred',
        severity: 'error',
      });
      dispatch(clearError());
    }
  }, [error, operationError, dispatch]);

  // Define table columns
  const columns: Column<ProductTableResponse>[] = [
    {
      id: 'sku',
      label: 'SKU',
      minWidth: 150,
      format: (value) => (
        <Typography variant="body2" fontWeight={500} fontFamily="monospace">
          {value || '-'}
        </Typography>
      ),
    },
    {
      id: 'name',
      label: 'Product Name',
      minWidth: 250,
      format: (value) => (
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'brandName',
      label: 'Brand',
      minWidth: 120,
      format: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      ),
    },
    {
      id: 'categoryName',
      label: 'Category',
      minWidth: 150,
      format: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      ),
    },
    {
      id: 'retailPrice',
      label: 'Price',
      minWidth: 120,
      align: 'right',
      format: (value) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          ${(value as number).toLocaleString()}
        </Typography>
      ),
    },
    {
      id: 'stockQuantity',
      label: 'Stock',
      minWidth: 100,
      align: 'center',
      format: (value) => {
        const stock = value as number;
        return (
          <Chip
            label={stock}
            color={stock > 0 ? 'success' : 'error'}
            size="small"
            sx={{ minWidth: 60 }}
          />
        );
      },
    },
    {
      id: 'isActive',
      label: 'Status',
      minWidth: 100,
      align: 'center',
      format: (value) => (
        <Chip
          label={value ? 'Active' : 'Inactive'}
          color={value ? 'success' : 'default'}
          size="small"
          sx={{ minWidth: 80 }}
        />
      ),
    },
  ];

  // Handlers
  const handleAdd = () => {
    router.push('/admin/products/create');
  };

  const handleView = (row: ProductTableResponse) => {
    router.push(`/admin/products/${row.id}`);
  };

  const handleEdit = (row: ProductTableResponse) => {
    router.push(`/admin/products/${row.id}/edit`);
  };

  const handleDelete = (row: ProductTableResponse) => {
    setSelectedRows([row]);
    setOpenDelete(true);
  };

  const handleBulkDelete = () => {
    if (selectedRows.length > 0) {
      setOpenDelete(true);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const ids = selectedRows.map((r) => r.id);
      await dispatch(deleteProducts(ids)).unwrap();
      setSnackbar({
        open: true,
        message: `${ids.length} product(s) deleted successfully`,
        severity: 'success',
      });
      setOpenDelete(false);
      setSelectedRows([]);
      dispatch(fetchProducts({}));
    } catch (err: any) {
      // Error handled by useEffect
    }
  };

  const handleRefresh = () => {
    dispatch(fetchProducts({}));
    setSnackbar({
      open: true,
      message: 'Data refreshed',
      severity: 'success',
    });
  };

  const handleClearFilters = () => {
    setSearchSku('');
    setSearchName('');
    setFilterBrand('');
    setFilterCategory('');
  };

  // Filter data
  const filteredProducts = products.filter((product) => {
    const matchSku =
      searchSku === '' ||
      (product.sku && product.sku.toLowerCase().includes(searchSku.toLowerCase()));
    const matchName =
      searchName === '' || product.name.toLowerCase().includes(searchName.toLowerCase());
    const matchBrand = filterBrand === '' || product.brandName === filterBrand;
    const matchCategory = filterCategory === '' || product.categoryName === filterCategory;

    return matchSku && matchName && matchBrand && matchCategory;
  });

  const activeFiltersCount =
    (searchSku ? 1 : 0) +
    (searchName ? 1 : 0) +
    (filterBrand ? 1 : 0) +
    (filterCategory ? 1 : 0);

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title="Product Management"
        subtitle="Manage products, inventory, and specifications"
        breadcrumbs={[{ label: 'Products', icon: <ProductIcon fontSize="small" /> }]}
        actions={[
          {
            label: 'Refresh',
            onClick: handleRefresh,
            icon: <RefreshIcon />,
            variant: 'outlined',
          },
          {
            label: 'Delete Selected',
            onClick: handleBulkDelete,
            variant: 'outlined',
            color: 'error',
            disabled: selectedRows.length === 0,
            hidden: selectedRows.length === 0,
          },
          {
            label: 'Add Product',
            onClick: handleAdd,
            icon: <AddIcon />,
            variant: 'contained',
          },
        ]}
        tags={[{ label: `${filteredProducts.length} Total` }]}
      />

      {/* Filter Bar */}
      <FilterBar
        searchFields={[
          {
            id: 'sku',
            label: 'SKU',
            placeholder: 'Search by SKU...',
            value: searchSku,
          },
          {
            id: 'name',
            label: 'Product Name',
            placeholder: 'Search by product name...',
            value: searchName,
          },
        ]}
        filters={[
          {
            id: 'brand',
            label: 'Brand',
            type: 'select',
            value: filterBrand,
            options: brands.map((b) => ({ value: b.name, label: b.name })),
          },
          {
            id: 'category',
            label: 'Category',
            type: 'select',
            value: filterCategory,
            options: categories.map((c) => ({ value: c.name, label: c.name })),
          },
        ]}
        onSearchChange={(fieldId: string, value: string) => {
          if (fieldId === 'sku') setSearchSku(value);
          if (fieldId === 'name') setSearchName(value);
        }}
        onFilterChange={(filterId: string, value: string) => {
          if (filterId === 'brand') setFilterBrand(value);
          if (filterId === 'category') setFilterCategory(value);
        }}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={filteredProducts.length}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setPage(0);
        }}
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        rowKey="id"
        emptyMessage="No products found"
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${selectedRows.length} Product(s)`}
        message={
          selectedRows.length === 1
            ? `Are you sure you want to delete product "${selectedRows[0]?.name}"?`
            : `Are you sure you want to delete ${selectedRows.length} products?`
        }
        loading={operationLoading}
      />

      {/* Loading Overlay */}
      <LoadingOverlay open={loading && products.length === 0} message="Loading products..." />

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
