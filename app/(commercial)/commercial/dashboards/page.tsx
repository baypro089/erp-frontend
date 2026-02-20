'use client';

import { Box, Grid, Paper, Typography, Card, CardContent, alpha, useTheme } from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  LocalShipping,
  Inventory,
  AttachMoney,
  People,
  Assessment,
  Warning,
} from '@mui/icons-material';

export default function CommercialDashboard() {
  const theme = useTheme();

  const stats = [
    {
      title: 'Doanh thu hôm nay',
      value: '125.000.000 ₫',
      change: '+15.3%',
      icon: <AttachMoney sx={{ fontSize: 40 }} />,
      color: theme.palette.success.main,
      gradient: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
    },
    {
      title: 'Đơn hàng chờ xử lý',
      value: '12',
      change: '+3',
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      color: theme.palette.warning.main,
      gradient: `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.main} 100%)`,
    },
    {
      title: 'Đơn đang giao',
      value: '8',
      change: '-2',
      icon: <LocalShipping sx={{ fontSize: 40 }} />,
      color: theme.palette.info.main,
      gradient: `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.main} 100%)`,
    },
    {
      title: 'Sản phẩm sắp hết',
      value: '5',
      change: 'Cần nhập',
      icon: <Warning sx={{ fontSize: 40 }} />,
      color: theme.palette.error.main,
      gradient: `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`,
    },
  ];

  const quickStats = [
    {
      label: 'Tổng khách hàng',
      value: '1,234',
      icon: <People />,
    },
    {
      label: 'Tổng sản phẩm',
      value: '892',
      icon: <Inventory />,
    },
    {
      label: 'Doanh thu tháng',
      value: '2.5 tỷ ₫',
      icon: <TrendingUp />,
    },
    {
      label: 'Đơn hoàn thành',
      value: '456',
      icon: <Assessment />,
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
          Commercial Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          Quản lý bán hàng & kho vận chuyên nghiệp
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
      <Grid container spacing={3}>
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

      {/* Additional Content Placeholder */}
      <Box sx={{ mt: 4 }}>
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
            Commercial POS System
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hệ thống quản lý bán hàng chuyên nghiệp với giao diện POS hiện đại
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
