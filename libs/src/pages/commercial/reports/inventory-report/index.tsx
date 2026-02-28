'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Print as PrintIcon,
  FileDownload as FileDownloadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { PageHeader, DataTable, Column, LoadingOverlay } from '@libs/src/components/common';
import { fetchWarehouses } from '@libs/src/features/warehouse/warehouse.slice';
import {
  fetchProductStatistics,
  exportReportToExcel,
  clearError,
} from '@libs/src/features/warehouse-report/warehouse-report.slice';
import type { IProductStatistics } from '@libs/shared/types/warehouse-report.type';

export default function InventoryReportPage() {
  const dispatch = useDispatch<AppDispatch>();
  
  const { warehouses } = useSelector((state: RootState) => state.warehouse);
  const { report, loading, error, exportLoading, exportError } = useSelector(
    (state: RootState) => state.warehouseReport
  );

  const currentDate = new Date();
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Load warehouses on mount
  useEffect(() => {
    dispatch(fetchWarehouses());
  }, [dispatch]);

  // Load report data when filters change
  useEffect(() => {
    handleLoadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWarehouseId, selectedMonth, selectedYear]);

  // Handle errors
  useEffect(() => {
    if (error || exportError) {
      setSnackbar({
        open: true,
        message: error || exportError || 'Có lỗi xảy ra',
        severity: 'error',
      });
      dispatch(clearError());
    }
  }, [error, exportError, dispatch]);

  const handleLoadReport = () => {
    const filter = {
      month: selectedMonth,
      year: selectedYear,
      ...(selectedWarehouseId && { warehouseId: selectedWarehouseId }),
    };
    dispatch(fetchProductStatistics(filter));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async () => {
    try {
      const filter = {
        month: selectedMonth,
        year: selectedYear,
        ...(selectedWarehouseId && { warehouseId: selectedWarehouseId }),
      };
      await dispatch(exportReportToExcel(filter)).unwrap();
      setSnackbar({
        open: true,
        message: 'Xuất báo cáo Excel thành công',
        severity: 'success',
      });
    } catch (err) {
      // Error handled by useEffect
    }
  };

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `Tháng ${(i + 1).toString().padStart(2, '0')}`,
  }));

  // Generate year options (current year ± 2 years)
  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i);

  // Format numbers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  // Define table columns
  const columns: Column<IProductStatistics>[] = [
    {
      id: 'sku',
      label: 'Mã SKU',
      minWidth: 120,
      format: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'productName',
      label: 'Tên sản phẩm',
      minWidth: 250,
      format: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'hasSerialNumber',
      label: 'Quản lý Serial',
      minWidth: 140,
      align: 'center',
      format: (value) =>
        value ? (
          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 24 }} />
        ) : (
          <CancelIcon sx={{ color: 'text.disabled', fontSize: 24 }} />
        ),
    },
    {
      id: 'totalImported',
      label: 'Nhập trong kỳ',
      minWidth: 130,
      align: 'right',
      format: (value) => (
        <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
          {formatNumber(value as number)}
        </Typography>
      ),
    },
    {
      id: 'totalExported',
      label: 'Xuất trong kỳ',
      minWidth: 130,
      align: 'right',
      format: (value) => (
        <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 600 }}>
          {formatNumber(value as number)}
        </Typography>
      ),
    },
    {
      id: 'currentStock',
      label: 'TỒN CUỐI KỲ',
      minWidth: 140,
      align: 'right',
      format: (value) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            fontSize: '1rem',
            color: value === 0 ? 'white' : 'text.primary',
            bgcolor: value === 0 ? 'error.main' : 'transparent',
            px: value === 0 ? 1.5 : 0,
            py: value === 0 ? 0.5 : 0,
            borderRadius: value === 0 ? 1 : 0,
          }}
        >
          {formatNumber(value as number)}
        </Typography>
      ),
    },
  ];

  const activeWarehouses = warehouses.filter((w) => w.isActive);
  const selectedWarehouse = selectedWarehouseId
    ? warehouses.find((w) => w.id === selectedWarehouseId)
    : null;

  return (
    <>
      {/* Screen version - Hidden when printing */}
      <Box className="screen-only">
        <PageHeader
          title="Báo cáo Xuất Nhập Tồn"
          subtitle="Thống kê xuất nhập tồn sản phẩm theo kỳ"
          breadcrumbs={[
            { label: 'Báo cáo', href: '/commercial/dashboards' },
            { label: 'Xuất Nhập Tồn', icon: <InventoryIcon fontSize="small" /> },
          ]}
        />

        {/* Filter Toolbar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <InputLabel>Kho</InputLabel>
              <Select
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                label="Kho"
              >
                <MenuItem value="">
                  <em>Tất cả các kho</em>
                </MenuItem>
                {activeWarehouses.map((warehouse) => (
                  <MenuItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Tháng</InputLabel>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                label="Tháng"
              >
                {months.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Năm</InputLabel>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                label="Năm"
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ flex: 1 }} />

            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              disabled={loading || !report}
            >
              In Báo Cáo
            </Button>

            <Button
              variant="contained"
              startIcon={exportLoading ? <CircularProgress size={20} /> : <FileDownloadIcon />}
              onClick={handleExport}
              disabled={loading || exportLoading || !report}
            >
              Xuất Excel
            </Button>
          </Stack>
        </Paper>

        {/* Loading State */}
        <LoadingOverlay open={loading} />

        {/* Data Table */}
        {!loading && report && (
          <DataTable
            columns={columns}
            data={report.data}
            loading={loading}
            page={0}
            rowsPerPage={report.data.length}
            totalRows={report.data.length}
            onPageChange={() => {}}
            onRowsPerPageChange={() => {}}
          />
        )}

        {/* No data message */}
        {!loading && (!report || report.data.length === 0) && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Không có dữ liệu cho kỳ báo cáo này
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Print version - Only visible when printing */}
      <Box className="print-only">
        <Box sx={{ p: 4 }}>
          {/* Header for Print */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              CÔNG TY TNHH NINJA PC VN
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              BÁO CÁO THỐNG KÊ XUẤT NHẬP TỒN SẢN PHẨM
            </Typography>
            <Typography variant="body1" sx={{ mb: 0.5 }}>
              Kỳ báo cáo: <strong>Tháng {String(selectedMonth).padStart(2, '0')}/{selectedYear}</strong>
            </Typography>
            <Typography variant="body1">
              Kho áp dụng:{' '}
              <strong>{selectedWarehouse ? selectedWarehouse.name : 'Tất cả các kho'}</strong>
            </Typography>
          </Box>

          {/* Table for Print */}
          {report && report.data.length > 0 && (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
                    Mã SKU
                  </th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
                    Tên sản phẩm
                  </th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                    Quản lý Serial
                  </th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                    Nhập trong kỳ
                  </th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                    Xuất trong kỳ
                  </th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                    TỒN CUỐI KỲ
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.data.map((item, index) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 600 }}>
                      {item.sku}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {item.productName}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                      {item.hasSerialNumber ? '✅' : '❌'}
                    </td>
                    <td
                      style={{
                        border: '1px solid #ddd',
                        padding: '8px',
                        textAlign: 'right',
                        color: '#2e7d32',
                      }}
                    >
                      {formatNumber(item.totalImported)}
                    </td>
                    <td
                      style={{
                        border: '1px solid #ddd',
                        padding: '8px',
                        textAlign: 'right',
                        color: '#ed6c02',
                      }}
                    >
                      {formatNumber(item.totalExported)}
                    </td>
                    <td
                      style={{
                        border: '1px solid #ddd',
                        padding: '8px',
                        textAlign: 'right',
                        fontWeight: 700,
                        backgroundColor: item.currentStock === 0 ? '#f44336' : 'transparent',
                        color: item.currentStock === 0 ? 'white' : 'inherit',
                      }}
                    >
                      {formatNumber(item.currentStock)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Footer for Signatures */}
          <Box sx={{ mt: 6, display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ textAlign: 'center', minWidth: 200 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 8 }}>
                Người lập biểu
              </Typography>
              <Typography variant="body2">................................</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', minWidth: 200 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 8 }}>
                Quản lý Kho
              </Typography>
              <Typography variant="body2">................................</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          /* Hide everything except print content */
          body * {
            visibility: hidden;
          }
          
          .print-only,
          .print-only * {
            visibility: visible;
          }
          
          .screen-only {
            display: none !important;
          }
          
          .print-only {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          
          /* Page setup */
          @page {
            size: A4 landscape;
            margin: 15mm;
          }
          
          /* Ensure proper page breaks */
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          thead {
            display: table-header-group;
          }
          
          tfoot {
            display: table-footer-group;
          }
        }
        
        /* Screen-only visibility */
        @media screen {
          .print-only {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
