'use client';

import { Box, Grid, Paper, Typography, Card, CardContent, alpha, useTheme } from '@mui/material';
import {
  People,
  EventNote,
  CheckCircle,
  AttachMoney,
  PersonOff,
  PersonAdd,
  TrendingUp,
  School,
  Schedule,
  Warning,
  Assessment,
  HowToReg,
} from '@mui/icons-material';

export default function HRDashboard() {
  const theme = useTheme();

  const stats = [
    {
      title: 'Tổng Nhân viên',
      value: '248',
      change: '+15 tháng này',
      icon: <People sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
    },
    {
      title: 'Đơn nghỉ chờ duyệt',
      value: '12',
      change: 'Cần xử lý',
      icon: <EventNote sx={{ fontSize: 40 }} />,
      color: theme.palette.warning.main,
      gradient: `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.main} 100%)`,
    },
    {
      title: 'Điểm danh hôm nay',
      value: '236/248',
      change: '95.2%',
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      color: theme.palette.success.main,
      gradient: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
    },
    {
      title: 'Lương đã xử lý',
      value: '5.2 tỷ ₫',
      change: 'Tháng này',
      icon: <AttachMoney sx={{ fontSize: 40 }} />,
      color: theme.palette.info.main,
      gradient: `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.main} 100%)`,
    },
  ];

  const quickStats = [
    {
      label: 'Đơn từ chức',
      value: '3',
      icon: <PersonOff />,
      color: theme.palette.error.main,
    },
    {
      label: 'Tuyển dụng mới',
      value: '8',
      icon: <PersonAdd />,
      color: theme.palette.success.main,
    },
    {
      label: 'Khóa đào tạo',
      value: '5',
      icon: <School />,
      color: theme.palette.info.main,
    },
    {
      label: 'Đánh giá định kỳ',
      value: '42',
      icon: <Assessment />,
      color: theme.palette.primary.main,
    },
  ];

  const hrMetrics = [
    {
      title: 'Tỷ lệ nghỉ việc',
      value: '3.2%',
      status: 'Thấp',
      icon: <TrendingUp />,
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.1),
    },
    {
      title: 'Thời gian onboarding',
      value: '7 ngày',
      status: 'Tốt',
      icon: <Schedule />,
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.1),
    },
    {
      title: 'Hợp đồng hết hạn',
      value: '5',
      status: '30 ngày tới',
      icon: <Warning />,
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.1),
    },
    {
      title: 'Chấm công đúng giờ',
      value: '92%',
      status: 'Xuất sắc',
      icon: <HowToReg />,
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.1),
    },
  ];

  const departmentStats = [
    { name: 'IT', count: 45, color: theme.palette.primary.main },
    { name: 'Sales', count: 68, color: theme.palette.success.main },
    { name: 'Marketing', count: 32, color: theme.palette.warning.main },
    { name: 'Operations', count: 56, color: theme.palette.info.main },
    { name: 'HR', count: 12, color: theme.palette.error.main },
    { name: 'Finance', count: 35, color: theme.palette.secondary.main },
  ];

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
          HR Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          Tổng quan quản lý nhân sự và tiền lương
        </Typography>
      </Box>

      {/* Main Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              sx={{
                height: '100%',
                background: stat.gradient,
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
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600 }}>
                      {stat.change}
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
                    {stat.icon}
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
              <Box
                sx={{
                  position: 'absolute',
                  top: -30,
                  left: -30,
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                }}
              />
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickStats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'all 0.2s',
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  borderColor: stat.color,
                },
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: alpha(stat.color, 0.1),
                  color: stat.color,
                }}
              >
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {stat.label}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {stat.value}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* HR Metrics */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Chỉ số nhân sự
        </Typography>
        <Grid container spacing={3}>
          {hrMetrics.map((metric, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Paper
                sx={{
                  p: 2.5,
                  backgroundColor: metric.bgColor,
                  border: `2px solid ${alpha(metric.color, 0.3)}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: metric.color,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'white',
                      color: metric.color,
                    }}
                  >
                    {metric.icon}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: metric.color }}>
                    {metric.value}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {metric.title}
                </Typography>
                <Typography variant="caption" sx={{ color: metric.color, fontWeight: 600 }}>
                  {metric.status}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Department Distribution */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Phân bổ nhân sự theo phòng ban
        </Typography>
        <Grid container spacing={2}>
          {departmentStats.map((dept, index) => (
            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={index}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: alpha(dept.color, 0.1),
                  border: `2px solid ${alpha(dept.color, 0.2)}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    borderColor: dept.color,
                  },
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 800, color: dept.color, mb: 0.5 }}>
                  {dept.count}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  {dept.name}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* System Info */}
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(
            theme.palette.primary.main,
            0.02
          )} 100%)`,
          border: `2px dashed ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: theme.palette.primary.main }}>
          HR Portal
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quản lý toàn diện nhân sự - Tuyển dụng, Đào tạo, Lương thưởng, Đánh giá
        </Typography>
      </Paper>
    </Box>
  );
}
