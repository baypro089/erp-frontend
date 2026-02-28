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
  Tooltip,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import {
  People,
  TrendingUp,
  TrendingDown,
  PersonOff,
  Warning,
  AttachMoney,
  EventNote,
  Cake,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { HrDashboardService } from '@libs/src/services/hr-dashboard.service';
import type { IHrDashboard } from '@libs/shared/types/hr-statistics.type';
import Link from 'next/link';

const DEPARTMENT_COLORS = ['#66BB6A', '#42A5F5', '#FFA726', '#AB47BC', '#EF5350', '#26A69A'];

const DEPARTMENT_COLORS = ['#66BB6A', '#42A5F5', '#FFA726', '#AB47BC', '#EF5350', '#26A69A'];

export default function HRDashboard() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<IHrDashboard | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return format(now, 'yyyy-MM');
  });

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await HrDashboardService.getHrDashboard({
        month: selectedMonth,
      });
      setDashboardData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu dashboard');
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
    percentage: dept.percentage,
    color: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length],
  })) || [];

  // Calculate current date info
  const currentDate = new Date();
  const dayOfWeek = format(currentDate, 'EEEE', { locale: vi });
  const dateStr = format(currentDate, 'dd/MM/yyyy');
  const monthStr = format(new Date(selectedMonth + '-01'), 'MM/yyyy');

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
                      {dashboardData.attendance.absentEmployees.length > 0 && (
                        <Tooltip
                          title={
                            <Box>
                              {dashboardData.attendance.absentEmployees.map((emp) => (
                                <Typography key={emp.id} variant="caption" sx={{ display: 'block' }}>
                                  • {emp.fullName}
                                </Typography>
                              ))}
                            </Box>
                          }
                          arrow
                        >
                          <Box>
                            <AvatarGroup max={3} sx={{ justifyContent: 'flex-start' }}>
                              {dashboardData.attendance.absentEmployees.map((emp) => (
                                <Avatar
                                  key={emp.id}
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    bgcolor: alpha(theme.palette.common.white, 0.3),
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {emp.fullName.charAt(0)}
                                </Avatar>
                              ))}
                            </AvatarGroup>
                          </Box>
                        </Tooltip>
                      )}
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
                      <Link href="/hr/leave-approvals" passHref legacyBehavior>
                        <Button
                          variant="contained"
                          size="small"
                          component="a"
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
                      </Link>
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
                          value={dashboardData.payroll.percentagePaid}
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
                        Đã thanh toán {dashboardData.payroll.percentagePaid}%
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
                      label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {departmentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => `${value} người`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Right: Events List */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, height: 450, overflow: 'auto' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Sự kiện sắp tới
                </Typography>

                {/* Birthdays */}
                {dashboardData.upcomingEvents.birthdays.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: theme.palette.info.main }}>
                      🎂 Sinh nhật trong tháng này
                    </Typography>
                    {dashboardData.upcomingEvents.birthdays.map((event) => (
                      <Box
                        key={event.employeeId}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1.5,
                          mb: 1,
                          borderRadius: 1,
                          backgroundColor: alpha(theme.palette.info.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: theme.palette.info.main, width: 32, height: 32 }}>
                            <Cake sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {event.fullName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(event.birthdayDate), 'dd/MM/yyyy')}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={event.daysUntil === 0 ? 'Hôm nay' : `${event.daysUntil} ngày nữa`}
                          size="small"
                          color="info"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Probation Endings */}
                {dashboardData.upcomingEvents.probationEndings.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: theme.palette.warning.main }}>
                      ⏰ Nhân viên sắp hết hạn thử việc
                    </Typography>
                    {dashboardData.upcomingEvents.probationEndings.map((event) => (
                      <Box
                        key={event.employeeId}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1.5,
                          mb: 1,
                          borderRadius: 1,
                          backgroundColor: alpha(theme.palette.warning.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: theme.palette.warning.main, width: 32, height: 32 }}>
                            <Warning sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {event.fullName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Hết hạn: {format(new Date(event.endDate), 'dd/MM/yyyy')}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={event.daysUntil === 0 ? 'Hôm nay' : `${event.daysUntil} ngày nữa`}
                          size="small"
                          color="warning"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}

                {dashboardData.upcomingEvents.birthdays.length === 0 &&
                  dashboardData.upcomingEvents.probationEndings.length === 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: 'text.secondary',
                      }}
                    >
                      <Typography variant="body2">Không có sự kiện sắp tới</Typography>
                    </Box>
                  )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
