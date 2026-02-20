'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Alert,
  Snackbar,
  Button,
} from '@mui/material';
import {
  Inventory as ProductIcon,
  Info as InfoIcon,
  QrCode as SerialIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { PageHeader, LoadingOverlay } from '@libs/src/components/common';
import ProductForm from '@libs/src/components/products/ProductForm';
import SerialLookup from '@libs/src/components/products/SerialLookup';
import {
  fetchProductById,
  clearError,
  clearCurrentProduct,
} from '@libs/src/features/product/product.slice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

interface ProductDetailPageProps {
  productId: string;
}

export default function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { currentProduct, loading, error, operationLoading, operationError } = useSelector(
    (state: RootState) => state.product
  );

  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Load product data
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId));
    }

    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [productId, dispatch]);

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEdit = () => {
    router.push(`/admin/products/${productId}/edit`);
  };

  const handleBack = () => {
    router.push('/admin/products');
  };

  // Show loading when fetching product details
  if (loading && !currentProduct) {
    return <LoadingOverlay open={true} message="Đang tải thông tin sản phẩm..." />;
  }

  // Show error if product not found
  if (error && !currentProduct) {
    return (
      <Box>
        <PageHeader
          title="Chi tiết sản phẩm"
          breadcrumbs={[
            { label: 'Sản phẩm', icon: <ProductIcon fontSize="small" />, href: '/admin/products' },
            { label: 'Chi tiết' },
          ]}
        />
        <Alert severity="error" sx={{ mt: 2 }}>
          {error || 'Không tìm thấy sản phẩm'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title={currentProduct?.name || 'Chi tiết sản phẩm'}
        subtitle={currentProduct ? `SKU: ${currentProduct.sku}` : ''}
        breadcrumbs={[
          { label: 'Sản phẩm', icon: <ProductIcon fontSize="small" />, href: '/admin/products' },
          { label: 'Chi tiết' },
        ]}
        actions={[
          {
            label: 'Quay lại',
            onClick: handleBack,
            icon: <ArrowBackIcon />,
            variant: 'outlined',
          },
          {
            label: 'Chỉnh sửa',
            onClick: handleEdit,
            icon: <EditIcon />,
            variant: 'contained' as const,
            color: 'primary' as const,
          },
        ]}
      />

      {/* Tabs */}
      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
          }}
        >
          <Tab
            icon={<InfoIcon />}
            iconPosition="start"
            label="Thông tin sản phẩm"
            sx={{ minHeight: 60, textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            icon={<SerialIcon />}
            iconPosition="start"
            label="Tra cứu Serial/IMEI"
            sx={{ minHeight: 60, textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            {currentProduct && (
              <Box>
                <ProductForm
                  selectedProduct={currentProduct}
                  onSubmit={async () => {}}
                  loading={false}
                  readOnly
                />
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <SerialLookup />
        </TabPanel>
      </Paper>

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
