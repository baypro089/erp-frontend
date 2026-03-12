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
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Card,
  CardContent,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  FileDownload as FileDownloadIcon,
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  Savings as SavingsIcon,
  Percent as PercentIcon,
  BarChart as BarChartIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
} from 'recharts';
import { PageHeader, DataTable, Column, LoadingOverlay, PermissionGuard } from '@libs/src/components/common';
import {
  fetchProfitReport,
  exportSalesReportToExcel,
  clearError,
} from '@libs/src/features/sales-report/sales-report.slice';
import type { ExportedDetails } from '@libs/shared/types/commercial-report.type';
import { ReportPeriod } from '@libs/shared/enums/report-period.enum';
import { usePermissionGuard } from '@libs/src/hooks';
import { PermissionDeniedDialog } from '@libs/src/components/common';
import { PERMISSIONS } from '@libs/shared/constants/permissions.constant';

// ─── Constants ────────────────────────────────────────────────────────────────

const QUARTER_OPTIONS = [
  { value: 1, label: 'Quý 1 (Tháng 1 – 3)' },
  { value: 2, label: 'Quý 2 (Tháng 4 – 6)' },
  { value: 3, label: 'Quý 3 (Tháng 7 – 9)' },
  { value: 4, label: 'Quý 4 (Tháng 10 – 12)' },
];

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `Tháng ${String(i + 1).padStart(2, '0')}`,
}));

const CHART_COLORS = [
  '#1976d2', '#2196f3', '#42a5f5', '#64b5f6', '#90caf9',
  '#1565c0', '#0d47a1', '#bbdefb', '#1e88e5', '#1976d2',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'decimal' }).format(value) + ' đ';

const formatShortNumber = (value: number): string => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} k`;
  return String(value);
};

// ─── Financial Card ───────────────────────────────────────────────────────────

interface FinancialCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bgcolor: string;
  tooltip?: string;
}

function FinancialCard({ title, value, icon, color, bgcolor, tooltip }: FinancialCardProps) {
  return (
    <Card
      elevation={2}
      sx={{
        flex: 1,
        minWidth: 200,
        borderLeft: `4px solid ${color}`,
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
            }}
          >
            {icon}
          </Box>
          {tooltip && (
            <Tooltip title={tooltip} placement="top">
              <InfoIcon sx={{ fontSize: 18, color: 'text.disabled', cursor: 'help' }} />
            </Tooltip>
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary" fontWeight={500} textTransform="uppercase" letterSpacing={0.5}>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={700} color={color} mt={0.5} noWrap>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ─── Custom Tooltip for Bar Chart ─────────────────────────────────────────────

function CustomBarTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ p: 1.5, maxWidth: 240 }}>
        <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>
          {label}
        </Typography>
        <Typography variant="body2" color="primary.main" fontWeight={600}>
          {formatCurrency(payload[0].value)} doanh thu
        </Typography>
      </Paper>
    );
  }
  return null;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SalesReportPage() {  return (
    <PermissionGuard 
      permission={PERMISSIONS.SALES_REPORT.VIEW}
      fallbackPath="/commercial"
    >
      <SalesReportPageContent />
    </PermissionGuard>
  );
}

function SalesReportPageContent() {  const dispatch = useDispatch<AppDispatch>();
  const { guardAction, permissionDialogProps } = usePermissionGuard();
  const { report, loading, error, exportLoading, exportError } = useSelector(
    (state: RootState) => state.salesReport
  );

  const currentDate = new Date();
  const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3);

  const [periodType, setPeriodType] = useState<ReportPeriod>(ReportPeriod.QUARTER);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(currentQuarter);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const yearOptions = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i);

  // ─── Build filter ────────────────────────────────────────────────────────────

  const buildFilter = () => ({
    periodType,
    ...(periodType === ReportPeriod.MONTH && { month: selectedMonth }),
    ...(periodType === ReportPeriod.QUARTER && { quarter: selectedQuarter }),
    year: selectedYear,
  });

  // ─── Load data ───────────────────────────────────────────────────────────────

  useEffect(() => {
    dispatch(fetchProfitReport(buildFilter()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodType, selectedMonth, selectedQuarter, selectedYear]);

  // ─── Handle errors ────────────────────────────────────────────────────────────

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

  // ─── Export ───────────────────────────────────────────────────────────────────

  const handleExportImpl = async () => {
    try {
      await dispatch(exportSalesReportToExcel(buildFilter())).unwrap();
      setSnackbar({ open: true, message: 'Xuất báo cáo Excel thành công!', severity: 'success' });
    } catch {
      // handled by useEffect
    }
  };

  const handleExport = guardAction(PERMISSIONS.SALES_REPORT.VIEW, handleExportImpl);

  // ─── Derived data ─────────────────────────────────────────────────────────────

  const financials = report?.financials;
  const exportedDetails = report?.exportedDetails ?? [];

  const top10ChartData = [...exportedDetails]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map((item) => ({
      name:
        item.productName.length > 20
          ? item.productName.slice(0, 20) + '…'
          : item.productName,
      fullName: item.productName,
      revenue: item.revenue,
      quantity: item.totalExportedQuantity,
    }));

  const profitMarginValue =
    financials?.profitMargin !== undefined
      ? typeof financials.profitMargin === 'number'
        ? `${financials.profitMargin.toFixed(1)}%`
        : `${financials.profitMargin}%`
      : '—';

  // ─── Period label for breadcrumb ─────────────────────────────────────────────

  const periodLabel =
    periodType === ReportPeriod.MONTH
      ? `Tháng ${selectedMonth}/${selectedYear}`
      : periodType === ReportPeriod.QUARTER
      ? `Quý ${selectedQuarter}/${selectedYear}`
      : `Năm ${selectedYear}`;

  // ─── Table columns ────────────────────────────────────────────────────────────

  const columns: Column<any>[] = [
    {
      id: 'sku',
      label: 'SKU',
      minWidth: 130,
      format: (value) => (
        <Typography
          variant="body2"
          fontWeight={700}
          fontFamily="monospace"
          color="primary.main"
        >
          {value}
        </Typography>
      ),
    },
    {
      id: 'productName',
      label: 'Tên Sản Phẩm',
      minWidth: 260,
      format: (value) => (
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'totalExportedQuantity',
      label: 'Số Lượng Đã Xuất',
      minWidth: 150,
      align: 'right',
      format: (value) => (
        <Typography variant="body2" fontWeight={600} color="warning.dark">
          {new Intl.NumberFormat('vi-VN').format(value as number)}
        </Typography>
      ),
    },
    {
      id: 'revenue',
      label: 'Tổng Tiền Mang Về',
      minWidth: 180,
      align: 'right',
      format: (value) => (
        <Typography variant="body2" fontWeight={700} color="success.dark">
          {formatCurrency(value as number)}
        </Typography>
      ),
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <Box>
        <PageHeader
          title="Báo Cáo Doanh Số & Lợi Nhuận"
          subtitle={`Phân tích doanh thu, giá vốn và lợi nhuận gộp • ${periodLabel}`}
          breadcrumbs={[
            { label: 'Báo cáo', href: '/commercial/dashboards' },
            { label: 'Doanh Số & Lợi Nhuận', icon: <TrendingUpIcon fontSize="small" /> },
          ]}
        />

        {/* ── Advanced Filter ────────────────────────────────────────────────── */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            flexWrap="wrap"
          >
            {/* Radio buttons */}
            <FormControl>
              <FormLabel sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5, fontSize: 13 }}>
                Kỳ báo cáo
              </FormLabel>
              <RadioGroup
                row
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value as ReportPeriod)}
              >
                <FormControlLabel
                  value={ReportPeriod.MONTH}
                  control={<Radio size="small" />}
                  label="Theo Tháng"
                />
                <FormControlLabel
                  value={ReportPeriod.QUARTER}
                  control={<Radio size="small" />}
                  label="Theo Quý"
                />
                <FormControlLabel
                  value={ReportPeriod.YEAR}
                  control={<Radio size="small" />}
                  label="Theo Năm"
                />
              </RadioGroup>
            </FormControl>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

            {/* Month selector */}
            {periodType === ReportPeriod.MONTH && (
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Tháng</InputLabel>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  label="Tháng"
                >
                  {MONTH_OPTIONS.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Quarter selector */}
            {periodType === ReportPeriod.QUARTER && (
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Quý</InputLabel>
                <Select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                  label="Quý"
                >
                  {QUARTER_OPTIONS.map((q) => (
                    <MenuItem key={q.value} value={q.value}>
                      {q.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Year selector */}
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel>Năm</InputLabel>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                label="Năm"
              >
                {yearOptions.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ flex: 1 }} />

            {/* Export button */}
            <Button
              variant="contained"
              color="success"
              size="medium"
              startIcon={
                exportLoading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <FileDownloadIcon />
                )
              }
              onClick={handleExport}
              disabled={loading || exportLoading || !report}
              sx={{ minWidth: 200, fontWeight: 700 }}
            >
              {exportLoading ? 'Đang xuất…' : '📥 Xuất Excel Báo Cáo'}
            </Button>
          </Stack>
        </Paper>

        {/* ── Loading overlay ────────────────────────────────────────────────── */}
        <LoadingOverlay open={loading} />

        {/* ── Financial Cards ────────────────────────────────────────────────── */}
        {!loading && financials && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2.5}
            mb={3}
            flexWrap="wrap"
            useFlexGap
          >
            <FinancialCard
              title="Doanh Thu"
              value={formatCurrency(financials.revenue)}
              icon={<AttachMoneyIcon />}
              color="#1565c0"
              bgcolor="#e3f2fd"
              tooltip="Tổng tiền bán hàng thu về trong kỳ"
            />
            <FinancialCard
              title="Giá Vốn Hàng Bán"
              value={formatCurrency(financials.cogs)}
              icon={<ShoppingCartIcon />}
              color="#546e7a"
              bgcolor="#eceff1"
              tooltip="Chi phí vốn để sản xuất / nhập kho hàng đã bán"
            />
            <FinancialCard
              title="Lợi Nhuận Gộp"
              value={formatCurrency(financials.grossProfit)}
              icon={<SavingsIcon />}
              color="#2e7d32"
              bgcolor="#e8f5e9"
              tooltip="Doanh Thu trừ Giá Vốn = tiền lời trước chi phí vận hành"
            />
            <FinancialCard
              title="Tỷ Suất Lợi Nhuận"
              value={profitMarginValue}
              icon={<PercentIcon />}
              color={
                typeof financials.profitMargin === 'number' && financials.profitMargin >= 20
                  ? '#2e7d32'
                  : '#e65100'
              }
              bgcolor={
                typeof financials.profitMargin === 'number' && financials.profitMargin >= 20
                  ? '#e8f5e9'
                  : '#fff3e0'
              }
              tooltip="Lợi nhuận gộp / Doanh thu × 100% — Cao hơn 20% là kinh doanh có lời"
            />
          </Stack>
        )}

        {/* ── Top 10 Chart ───────────────────────────────────────────────────── */}
        {!loading && top10ChartData.length > 0 && (
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2.5}>
              <BarChartIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Top 10 Sản Phẩm Bán Chạy Nhất
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({periodLabel} — xếp theo doanh thu)
              </Typography>
            </Stack>

            <ResponsiveContainer width="100%" height={360}>
              <BarChart
                layout="vertical"
                data={top10ChartData}
                margin={{ top: 4, right: 40, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={formatShortNumber}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={165}
                  tick={{ fontSize: 12, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(25,118,210,0.06)' }} />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]} label={{ position: 'right', formatter: (v: any) => formatShortNumber(Number(v)), fontSize: 11, fill: '#546e7a' }}>
                  {top10ChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        )}

        {/* ── Detail Table ───────────────────────────────────────────────────── */}
        {!loading && exportedDetails.length > 0 && (
          <>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <Typography variant="h6" fontWeight={700}>
                Chi Tiết Hàng Đã Xuất
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({exportedDetails.length} sản phẩm — dữ liệu xuất Excel cho Kế Toán)
              </Typography>
            </Stack>
            <DataTable
              columns={columns}
              data={exportedDetails}
              rowKey="sku"
              rowsPerPage={25}
            />
          </>
        )}

        {/* ── Empty state when no data ───────────────────────────────────────── */}
        {!loading && !report && (
          <Paper elevation={1} sx={{ p: 6, textAlign: 'center', mt: 2 }}>
            <TrendingUpIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" fontWeight={600}>
              Chưa có dữ liệu báo cáo
            </Typography>
            <Typography variant="body2" color="text.disabled" mt={1}>
              Hệ thống sẽ tự động tải dữ liệu theo bộ lọc đã chọn.
            </Typography>
          </Paper>
        )}
      </Box>

      {/* ── Snackbar ──────────────────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          elevation={3}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <PermissionDeniedDialog {...permissionDialogProps} />
    </>
  );
}
