'use client';

import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  Divider,
  Typography,
} from '@mui/material';
import {
  Person,
  Receipt,
  ExitToApp,
  CalendarMonth,
  Dashboard,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';

const drawerWidth = 240;

interface PersonalPageSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    title: 'Tổng quan',
    icon: <Dashboard />,
    path: '/personal-page',
  },
  {
    title: 'Hồ sơ cá nhân',
    icon: <Person />,
    path: '/personal-page/profile',
  },
  {
    title: 'Phiếu lương',
    icon: <Receipt />,
    path: '/personal-page/my-payslips',
  },
  {
    title: 'Nghỉ phép',
    icon: <CalendarMonth />,
    path: '/personal-page/my-leaves',
  },
  {
    title: 'Đơn từ chức',
    icon: <ExitToApp />,
    path: '/personal-page/my-resignation',
  },
];

export default function PersonalPageSidebar({
  mobileOpen,
  onClose,
}: PersonalPageSidebarProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
    if (mobileOpen) {
      onClose();
    }
  };

  const drawerContent = (
    <Box sx={{ overflow: 'auto', mt: 8 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
          Chức năng cá nhân
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 2,
                  backgroundColor: isActive
                    ? alpha(theme.palette.primary.main, 0.1)
                    : 'transparent',
                  color: isActive ? theme.palette.primary.main : 'text.primary',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                  '&::before': isActive
                    ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 4,
                        height: '60%',
                        backgroundColor: theme.palette.primary.main,
                        borderRadius: '0 4px 4px 0',
                      }
                    : {},
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? theme.palette.primary.main : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.9rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
