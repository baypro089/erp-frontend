'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  alpha,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  AttachMoney,
  LocalShipping,
  EmojiEvents,
} from '@mui/icons-material';
import { SalesDashboardService } from '@libs/src/services/sales-dashboard.service';
import type { ISalesDashboard } from '@libs/shared/types/sales-statistics.type';
import { keyframes } from '@mui/system';

// Animation nhấp nháy cho card Đơn chờ Kho xuất
const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

export default function CommercialDashboard() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ISalesDashboard | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const result = await SalesDashboardService.getSalesDashboard();
      setData(result);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const getTrophyIcon = (rank: number) => {
    const colors = {
      1: '#FFD700', // Vàng
      2: '#C0C0C0', // Bạc
      3: '#CD7F32', // Đồng
    };
    return <EmojiEvents sx={{ color: colors[rank as keyof typeof colors] || theme.palette.grey[400], mr: 1 }} />;
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 800 }}>
          Sales Dashboard
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Không thể tải dữ liệu dashboard
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
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
          Sales Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          Theo dõi doanh thu và hiệu suất bán hàng
        </Typography>
      </Box>

      {/* Main Stats Grid - Thẻ nổi bật */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 1. Doanh thu hôm nay - TO ĐÙNG */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
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
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 700, mb: 2 }}>
                    💰 Doanh thu hôm nay
                  </Typography>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      mb: 1,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    {formatCurrency(data.metrics.todayRevenue)}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 600 }}>
                    Doanh thu tháng: {formatCurrency(data.metrics.monthRevenue)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: alpha(theme.palette.common.white, 0.2),
                    borderRadius: 3,
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AttachMoney sx={{ fontSize: 60 }} />
                </Box>
              </Box>
            </CardContent>
            {/* Decorative circles */}
            <Box
              sx={{
                position: 'absolute',
                bottom: -40,
                right: -40,
                width: 150,
                height: 150,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.common.white, 0.1),
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: -30,
                left: -30,
                width: 100,
                height: 100,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.common.white, 0.1),
              }}
            />
          </Card>
        </Grid>

        {/* 2. Đơn chờ Kho xuất - MÀU ĐỎ NHẤP NHÁY */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              animation: data.metrics.pendingOrders > 0 ? `${blink} 2s ease-in-out infinite` : 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
              },
            }}
          >
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 700, mb: 2 }}>
                    🚨 Đơn chờ Kho xuất
                  </Typography>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      mb: 1,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    {data.metrics.pendingOrders}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 600 }}>
                    {data.metrics.pendingOrders > 0
                      ? '⚡ Cần gọi điện giục Kho ngay!'
                      : '✅ Tất cả đơn đã xử lý'}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', mt: 1 }}>
                    Tỷ lệ hủy đơn: {data.metrics.cancelRate.toFixed(1)}%
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: alpha(theme.palette.common.white, 0.2),
                    borderRadius: 3,
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LocalShipping sx={{ fontSize: 60 }} />
                </Box>
              </Box>
            </CardContent>
            {/* Decorative circles */}
            <Box
              sx={{
                position: 'absolute',
                bottom: -40,
                right: -40,
                width: 150,
                height: 150,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.common.white, 0.1),
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: -30,
                left: -30,
                width: 100,
                height: 100,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.common.white, 0.1),
              }}
            />
          </Card>
        </Grid>
      </Grid>

      {/* 3. Bảng Khen thưởng - Top Sale với icon 🏆 */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <EmojiEvents sx={{ fontSize: 32, color: theme.palette.warning.main, mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                🏆 Bảng Xếp Hạng Sale (Top 3)
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, width: 80 }}>Hạng</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Nhân viên</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Số đơn</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Doanh thu</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.topStaffs.length > 0 ? (
                    data.topStaffs.map((staff) => (
                      <TableRow
                        key={staff.staffName || staff.rank}
                        sx={{
                          backgroundColor:
                            staff.rank === 1
                              ? alpha(theme.palette.warning.main, 0.1)
                              : staff.rank === 2
                              ? alpha(theme.palette.info.main, 0.05)
                              : staff.rank === 3
                              ? alpha(theme.palette.success.main, 0.05)
                              : 'transparent',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          },
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getTrophyIcon(staff.rank)}
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 800,
                                color:
                                  staff.rank === 1
                                    ? '#FFD700'
                                    : staff.rank === 2
                                    ? '#C0C0C0'
                                    : staff.rank === 3
                                    ? '#CD7F32'
                                    : 'inherit',
                              }}
                            >
                              #{staff.rank}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600 }}>{staff.staffName}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>
                          <Typography sx={{ fontWeight: 600 }}>{staff.totalOrders}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>
                          <Typography sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                            {formatCurrency(staff.totalRevenue)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary">Chưa có dữ liệu xếp hạng</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Khách hàng VIP */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              👑 Khách hàng VIP
            </Typography>
            {data.topCustomers.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {data.topCustomers.map((customer) => (
                  <Paper
                    key={customer.phone || customer.customerName}
                    sx={{
                      p: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                      },
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {customer.customerName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      📞 {customer.phone}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                      {formatCurrency(customer.totalSpent)}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">Chưa có dữ liệu khách hàng VIP</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
