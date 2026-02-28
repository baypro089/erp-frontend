'use client';

import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { 
  Person, 
  Receipt, 
  ExitToApp, 
  CalendarMonth 
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function PersonalPage() {
  const router = useRouter();

  const menuItems = [
    {
      title: 'Hồ sơ cá nhân',
      description: 'Xem và cập nhật thông tin cá nhân',
      icon: <Person sx={{ fontSize: 48, color: 'primary.main' }} />,
      path: '/personal-page/profile',
    },
    {
      title: 'Phiếu lương',
      description: 'Xem phiếu lương của bạn',
      icon: <Receipt sx={{ fontSize: 48, color: 'success.main' }} />,
      path: '/personal-page/my-payslips',
    },
    {
      title: 'Nghỉ phép',
      description: 'Quản lý đơn nghỉ phép',
      icon: <CalendarMonth sx={{ fontSize: 48, color: 'info.main' }} />,
      path: '/personal-page/my-leaves',
    },
    {
      title: 'Đơn từ chức',
      description: 'Quản lý đơn từ chức',
      icon: <ExitToApp sx={{ fontSize: 48, color: 'error.main' }} />,
      path: '/personal-page/my-resignation',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Trang cá nhân
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Quản lý thông tin và các yêu cầu cá nhân của bạn
      </Typography>

      <Grid container spacing={3}>
        {menuItems.map((item, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => router.push(item.path)}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                {item.icon}
                <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
