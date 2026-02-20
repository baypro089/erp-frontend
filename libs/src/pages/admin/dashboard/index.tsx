'use client';

import { Box, Grid, Paper, Typography, Card, CardContent, alpha, useTheme } from '@mui/material';
import {
  People,
  Security,
  BusinessCenter,
  AccountTree,
  Event,
  Settings,
  Category,
  BrandingWatermark,
  TrendingUp,
  CheckCircle,
  Warning,
  Schedule,
} from '@mui/icons-material';

export default function AdminDashboard() {
  const theme = useTheme();

  const stats = [
    {
      title: 'Tổng Người dùng',
      value: '156',
      change: '+12 tháng này',
      icon: <People sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
    },
    {
      title: 'Vai trò Hoạt động',
      value: '8',
      change: '100% active',
      icon: <Security sx={{ fontSize: 40 }} />,
      color: theme.palette.success.main,
      gradient: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
    },
    {
      title: 'Phòng ban',
      value: '12',
      change: '+2 mới',
      icon: <AccountTree sx={{ fontSize: 40 }} />,
      color: theme.palette.info.main,
      gradient: `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.main} 100%)`,
    },
    {
      title: 'Ngày nghỉ lễ',
      value: '15',
      change: 'Năm 2026',
      icon: <Event sx={{ fontSize: 40 }} />,
      color: theme.palette.warning.main,
      gradient: `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.main} 100%)`,
    },
  ];

  const quickStats = [
    {
      label: 'Vị trí công việc',
      value: '24',
      icon: <BusinessCenter />,
    },
    {
      label: 'Cài đặt hệ thống',
      value: '18',
      icon: <Settings />,
    },
    {
      label: 'Danh mục sản phẩm',
      value: '45',
      icon: <Category />,
    },
    {
      label: 'Thương hiệu',
      value: '32',
      icon: <BrandingWatermark />,
    },
  ];

  const recentActivities = [
    {
      title: 'Người dùng đăng nhập',
      count: '142',
      time: 'Hôm nay',
      icon: <CheckCircle />,
      color: theme.palette.success.main,
    },
    {
      title: 'Đang chờ phê duyệt',
      count: '8',
      time: 'Cần xử lý',
      icon: <Schedule />,
      color: theme.palette.warning.main,
    },
    {
      title: 'Cảnh báo hệ thống',
      count: '2',
      time: 'Ưu tiên thấp',
      icon: <Warning />,
      color: theme.palette.error.main,
    },
    {
      title: 'Hiệu suất hệ thống',
      count: '98%',
      time: 'Tốt',
      icon: <TrendingUp />,
      color: theme.palette.info.main,
    },
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
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          Tổng quan quản trị hệ thống ERP
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
                  borderColor: theme.palette.primary.main,
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
                  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                  color: 'white',
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

      {/* Recent Activities */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Hoạt động gần đây
        </Typography>
        <Grid container spacing={3}>
          {recentActivities.map((activity, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Paper
                sx={{
                  p: 2.5,
                  border: `2px solid ${alpha(activity.color, 0.2)}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: activity.color,
                    boxShadow: `0 4px 12px ${alpha(activity.color, 0.2)}`,
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
                      backgroundColor: alpha(activity.color, 0.1),
                      color: activity.color,
                    }}
                  >
                    {activity.icon}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: activity.color }}>
                    {activity.count}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {activity.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {activity.time}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

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
          Admin Portal
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quản trị toàn diện hệ thống ERP - Người dùng, Phân quyền, Cấu hình
        </Typography>
      </Paper>
    </Box>
  );
}
