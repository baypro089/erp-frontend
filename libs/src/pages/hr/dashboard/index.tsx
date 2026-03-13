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
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
  Button,
} from '@mui/material';
import {
  People,
  TrendingUp,
  TrendingDown,
  PersonOff,
  AttachMoney,
  EventNote,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { useState, useEffect, useCallback } from 'react';
import { differenceInCalendarDays, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { HrDashboardService } from '@libs/src/services/hr-dashboard.service';
import type { IHrDashboard } from '@libs/shared/types/hr-statistics.type';
import leaveRequestService from '@libs/src/features/leave-request/leave-request.service';
import { LeaveRequestStatus, LeaveRequestType } from '@libs/shared/enums/leave-request-status.enum';
import type { LeaveRequestResponse } from '@libs/shared/types/leave-requests.type';
import Link from 'next/link';

const DEPARTMENT_COLORS = ['#66BB6A', '#42A5F5', '#FFA726', '#AB47BC', '#EF5350', '#26A69A'];

export default function HRDashboard() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<IHrDashboard | null>(null);
  const [maternityLeaves, setMaternityLeaves] = useState<LeaveRequestResponse[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return format(now, 'yyyy-MM');
  });

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [data, maternityLeaveData] = await Promise.all([
        HrDashboardService.getHrDashboard({
          month: selectedMonth,
        }),
        leaveRequestService.getLeaveRequests(
          LeaveRequestStatus.APPROVED,
          undefined,
          undefined,
          1,
          100,
        ),
      ]);

      setDashboardData(data);

      const today = new Date();
      const activeMaternityLeaves = maternityLeaveData.items.filter((request) => {
        if (request.type !== LeaveRequestType.MATERNITY) {
          return false;
        }
        const startDate = new Date(request.startDate);
        const endDate = new Date(request.endDate);
        return endDate >= today || startDate >= today;
      });

      setMaternityLeaves(activeMaternityLeaves);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Không thể tải dữ liệu dashboard';
      setError(message);
      console.error('Error fetching HR dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  // Auto fetch when month changes
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  // Prepare chart data for department distribution
  const departmentChartData = dashboardData?.departmentDistribution.map((dept, index) => ({
    name: dept.departmentName,
    value: dept.count,
    color: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length],
  })) || [];

  // Calculate percentage paid
  const percentagePaid = dashboardData && dashboardData.payroll.totalEstimated > 0
    ? Math.round((dashboardData.payroll.totalPaid / dashboardData.payroll.totalEstimated) * 100)
    : 0;

  // Calculate current date info
  const currentDate = new Date();
  const dayOfWeek = format(currentDate, 'EEEE', { locale: vi });
  const dateStr = format(currentDate, 'dd/MM/yyyy');
  const monthStr = format(new Date(selectedMonth + '-01'), 'MM/yyyy');

  const getMaternityProgress = (request: LeaveRequestResponse) => {
    const today = new Date();
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    const totalDays = Math.max(differenceInCalendarDays(endDate, startDate), 1);
    const elapsedDays = Math.min(Math.max(differenceInCalendarDays(today, startDate), 0), totalDays);
    const remainingDays = Math.max(differenceInCalendarDays(endDate, today), 0);
    const progress = Math.min(Math.round((elapsedDays / totalDays) * 100), 100);

    return {
      progress,
      remainingDays,
      totalDays,
      isUpcoming: today < startDate,
    };
  };

  return (
    <Box>
      {/* Header with Greeting & Month Filter */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Xin chào Trưởng phòng HR, hôm nay là {dayOfWeek}, {dateStr}.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng quan quản lý nhân sự và tiền lương
          </Typography>
        </Box>

        {/* Month Filter */}
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            displayEmpty
          >
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const value = format(date, 'yyyy-MM');
              const label = format(date, 'MM/yyyy');
              return (
                <MenuItem key={value} value={value}>
                  Tháng {label}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
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
          {/* 4 Main Widgets */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Widget 1: Tổng nhân sự */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                        Tổng nhân sự
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                        {dashboardData.headcount.totalActive}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<TrendingUp sx={{ fontSize: 14 }} />}
                          label={`+${dashboardData.headcount.newHires} nhân sự mới`}
                          size="small"
                          sx={{
                            backgroundColor: alpha('#4caf50', 0.9),
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        />
                        <Chip
                          icon={<TrendingDown sx={{ fontSize: 14 }} />}
                          label={`-${dashboardData.headcount.resigned} nghỉ việc`}
                          size="small"
                          sx={{
                            backgroundColor: alpha('#f44336', 0.9),
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        />
                      </Box>
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
                      <People sx={{ fontSize: 40 }} />
                    </Box>
                  </Box>
                </CardContent>
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

            {/* Widget 2: Vắng mặt hôm nay */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
                        Vắng mặt hôm nay
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                        {dashboardData.attendance.onLeaveToday} người
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
                      <PersonOff sx={{ fontSize: 40 }} />
                    </Box>
                  </Box>
                </CardContent>
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

            {/* Widget 3: Cần xử lý đơn nghỉ phép */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
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
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600, mb: 1 }}>
                        Cần xử lý
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                        {dashboardData.attendance.pendingRequests} Đơn nghỉ phép
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        component={Link}
                        href="/hr/leave-approvals"
                        sx={{
                          backgroundColor: alpha(theme.palette.common.white, 0.9),
                          color: '#fa709a',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          '&:hover': {
                            backgroundColor: theme.palette.common.white,
                          },
                        }}
                      >
                        Duyệt ngay
                      </Button>
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
                      <EventNote sx={{ fontSize: 40 }} />
                    </Box>
                  </Box>
                </CardContent>
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

            {/* Widget 4: Quỹ lương dự kiến */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
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
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600, mb: 1 }}>
                        Quỹ lương dự kiến
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, fontSize: '1.2rem' }}>
                        {formatCurrency(dashboardData.payroll.totalEstimated)}
                      </Typography>
                      <Box sx={{ mb: 0.5 }}>
                        <LinearProgress
                          variant="determinate"
                          value={percentagePaid}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: alpha(theme.palette.common.white, 0.3),
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: theme.palette.common.white,
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600 }}>
                        Đã thanh toán {percentagePaid}%
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
                      <AttachMoney sx={{ fontSize: 40 }} />
                    </Box>
                  </Box>
                </CardContent>
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
          </Grid>

          {/* Maternity leave widget */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Nhân sự nghỉ thai sản
              </Typography>
              <Chip
                label={`${maternityLeaves.length} nhân sự`}
                color="secondary"
                variant="outlined"
                size="small"
              />
            </Box>

            {maternityLeaves.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Hiện không có nhân sự nào đang hoặc sắp bước vào kỳ nghỉ thai sản.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {maternityLeaves.slice(0, 6).map((request) => {
                  const maternityInfo = getMaternityProgress(request);

                  return (
                    <Box
                      key={request.id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 1 }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {request.employee.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(request.startDate).toLocaleDateString('vi-VN')} - {new Date(request.endDate).toLocaleDateString('vi-VN')}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          color={maternityInfo.isUpcoming ? 'info' : maternityInfo.remainingDays <= 30 ? 'warning' : 'success'}
                          label={
                            maternityInfo.isUpcoming
                              ? 'Sắp bắt đầu nghỉ'
                              : `Còn ${maternityInfo.remainingDays} ngày`
                          }
                        />
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={maternityInfo.progress}
                        sx={{
                          height: 10,
                          borderRadius: 999,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 999,
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Tiến độ kỳ nghỉ: {maternityInfo.progress}% ({maternityInfo.totalDays} ngày)
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>

          {/* Charts Row */}
          <Grid container spacing={3}>
            {/* Left: Pie Chart - Department Distribution */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, height: 450 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Phân bổ nhân sự theo bộ phận
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie
                      data={departmentChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {departmentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number | undefined) => `${value || 0} người`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Right: Statistics Summary */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, height: 450 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Thống kê tháng {monthStr}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Headcount Summary */}
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <People sx={{ fontSize: 32, mr: 1.5, color: theme.palette.primary.main }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          Biến động nhân sự
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Tổng nhân sự hiện tại:</Typography>
                        <Typography variant="body2" fontWeight={700}>{dashboardData.headcount.totalActive} người</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="success.main">Nhân sự mới tuyển:</Typography>
                        <Typography variant="body2" fontWeight={700} color="success.main">+{dashboardData.headcount.newHires} người</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="error.main">Nhân sự nghỉ việc:</Typography>
                        <Typography variant="body2" fontWeight={700} color="error.main">-{dashboardData.headcount.resigned} người</Typography>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Payroll Summary */}
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AttachMoney sx={{ fontSize: 32, mr: 1.5, color: theme.palette.success.main }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          Tổng quan lương
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Tổng quỹ lương:</Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {formatCurrency(dashboardData.payroll.totalEstimated)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="success.main">Đã thanh toán:</Typography>
                        <Typography variant="body2" fontWeight={700} color="success.main">
                          {formatCurrency(dashboardData.payroll.totalPaid)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="warning.main">Còn lại:</Typography>
                        <Typography variant="body2" fontWeight={700} color="warning.main">
                          {formatCurrency(dashboardData.payroll.totalEstimated - dashboardData.payroll.totalPaid)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Attendance Summary */}
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <EventNote sx={{ fontSize: 32, mr: 1.5, color: theme.palette.warning.main }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          Nghỉ phép & Chấm công
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Nghỉ phép hôm nay:</Typography>
                        <Typography variant="body2" fontWeight={700}>{dashboardData.attendance.onLeaveToday} người</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="warning.main">Đơn chờ duyệt:</Typography>
                        <Typography variant="body2" fontWeight={700} color="warning.main">{dashboardData.attendance.pendingRequests} đơn</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
