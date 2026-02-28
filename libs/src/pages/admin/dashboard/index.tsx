'use client';

import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  alpha,
  useTheme,
  MenuItem,
  Select,
  FormControl,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Inventory2,
  AccountBalance,
  People,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useState, useEffect, useCallback } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';
import { AdminDashboardService } from '@libs/src/services/admin-dashboard.service';
import type { IAdminDashboard } from '@libs/shared/types/statistics.type';
import Link from 'next/link';

type DatePreset = 'this-month' | 'last-month' | 'this-quarter' | 'this-year' | 'custom';

const COLORS = {
  pending: '#FFA726',
  processing: '#42A5F5',
  shipped: '#AB47BC',
  delivered: '#66BB6A',
  cancelled: '#EF5350',
};

export default function AdminDashboard() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<IAdminDashboard | null>(null);
  
  // Date filter states
  const [datePreset, setDatePreset] = useState<DatePreset>('this-month');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Initialize dates based on preset
  useEffect(() => {
    const now = new Date();
    let from: Date;
    let to: Date;

    switch (datePreset) {
      case 'this-month':
        from = startOfMonth(now);
        to = endOfMonth(now);
        break;
      case 'last-month':
        from = startOfMonth(subMonths(now, 1));
        to = endOfMonth(subMonths(now, 1));
        break;
      case 'this-quarter':
        from = startOfQuarter(now);
        to = endOfQuarter(now);
        break;
      case 'this-year':
        from = startOfYear(now);
        to = endOfYear(now);
        break;
      case 'custom':
        return; // Don't auto-set dates for custom
      default:
        from = startOfMonth(now);
        to = endOfMonth(now);
    }

    setFromDate(format(from, 'yyyy-MM-dd'));
    setToDate(format(to, 'yyyy-MM-dd'));
  }, [datePreset]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!fromDate || !toDate) return;

    setLoading(true);
    setError(null);

    try {
      const data = await AdminDashboardService.getMasterDashboard({
        fromDate,
        toDate,
      });
      setDashboardData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu dashboard');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  // Auto fetch when dates change
  useEffect(() => {
    if (fromDate && toDate) {
      fetchDashboardData();
    }
  }, [fromDate, toDate, fetchDashboardData]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  // Prepare chart data
  const orderChartData = dashboardData
    ? [
        { name: 'Chờ xử lý', value: dashboardData.orderStats.pending, color: COLORS.pending },
        { name: 'Đang xử lý', value: dashboardData.orderStats.processing, color: COLORS.processing },
        { name: 'Đang giao', value: dashboardData.orderStats.shipped, color: COLORS.shipped },
        { name: 'Đã giao', value: dashboardData.orderStats.delivered, color: COLORS.delivered },
        { name: 'Đã hủy', value: dashboardData.orderStats.cancelled, color: COLORS.cancelled },
      ]
    : [];

  const topProductsData = dashboardData?.topProducts || [];

  // Widget data
  const widgets = [
    {
      title: 'Doanh thu',
      value: dashboardData?.overview.totalRevenue || 0,
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      color: '#66BB6A',
      gradient: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
    },
    {
      title: 'Chi phí nhập hàng',
      value: dashboardData?.overview.totalCost || 0,
      icon: <Inventory2 sx={{ fontSize: 40 }} />,
      color: '#FF9800',
      gradient: 'linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)',
    },
    {
      title: 'Lợi nhuận gộp',
      value: dashboardData?.overview.grossProfit || 0,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#42A5F5',
      gradient: 'linear-gradient(135deg, #42A5F5 0%, #2196F3 100%)',
    },
    {
      title: 'Quỹ lương',
      value: dashboardData?.overview.totalPayroll || 0,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#757575',
      gradient: 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)',
    },
  ];

  return (
    <Box>
      {/* Header with Date Filter */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            Tổng quan quản trị hệ thống ERP
          </Typography>
        </Box>

        {/* Date Filter */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as DatePreset)}
              displayEmpty
            >
              <MenuItem value="this-month">Tháng này</MenuItem>
              <MenuItem value="last-month">Tháng trước</MenuItem>
              <MenuItem value="this-quarter">Quý này</MenuItem>
              <MenuItem value="this-year">Năm nay</MenuItem>
              <MenuItem value="custom">Tùy chỉnh</MenuItem>
            </Select>
          </FormControl>

          <TextField
            type="date"
            size="small"
            label="Từ ngày"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setDatePreset('custom');
            }}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 160 }}
          />

          <TextField
            type="date"
            size="small"
            label="Đến ngày"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setDatePreset('custom');
            }}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 160 }}
          />
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Dashboard Content */}
      {!loading && dashboardData && (
        <>
          {/* 4 Widget Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {widgets.map((widget, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    background: widget.gradient,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600, mb: 1 }}>
                          {widget.title}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                          {formatCurrency(widget.value)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          backgroundColor: alpha(theme.palette.common.white, 0.2),
                          borderRadius: 2,
                          p: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {widget.icon}
                      </Box>
                    </Box>
                  </CardContent>
                  {/* Decorative circles */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -20,
                      right: -20,
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                    }}
                  />
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Charts Row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Pie Chart - Order Status */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Tỷ lệ trạng thái đơn hàng
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie
                      data={orderChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value || 0} đơn`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Bar Chart - Top Products */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Top 5 Sản phẩm bán chạy nhất
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={topProductsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="productName" angle={-15} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => {
                        const val = value || 0;
                        if (name === 'revenue') return [formatCurrency(val as number), 'Doanh thu'];
                        return [val, 'Số lượng bán'];
                      }}
                    />
                    <Bar dataKey="totalSold" fill={theme.palette.primary.main} name="Số lượng bán" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* Low Stock Alert */}
          {dashboardData.lowStockAlerts > 0 && (
            <Paper
              sx={{
                p: 3,
                background: alpha(theme.palette.error.main, 0.05),
                border: `2px solid ${alpha(theme.palette.error.main, 0.3)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                  }}
                >
                  <Warning sx={{ fontSize: 32 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.error.main, mb: 0.5 }}>
                    Cảnh báo tồn kho
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Hiện có <strong style={{ color: theme.palette.error.main }}>{dashboardData.lowStockAlerts} mã sản phẩm</strong> sắp hết hàng.{' '}
                    <Link href="/commercial/inventory" style={{ color: theme.palette.primary.main, fontWeight: 600, textDecoration: 'none' }}>
                      [Click vào đây để xem chi tiết ở site Kho]
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {dashboardData.lowStockAlerts === 0 && (
            <Paper
              sx={{
                p: 3,
                background: alpha(theme.palette.success.main, 0.05),
                border: `2px solid ${alpha(theme.palette.success.main, 0.3)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main,
                  }}
                >
                  <CheckCircle sx={{ fontSize: 32 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.success.main, mb: 0.5 }}>
                    Tồn kho ổn định
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Tất cả sản phẩm đang có số lượng tồn kho đầy đủ.
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}
