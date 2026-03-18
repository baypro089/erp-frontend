'use client';


import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import { Box, Toolbar, useTheme } from '@mui/material';
import ClientOnly from '@libs/src/components/ClientOnly';
import AdminSidebar from '@libs/src/components/layout/AdminSidebar';
import AdminHeader from '@libs/src/components/layout/AdminHeader';
import { fetchUserById } from '@libs/src/features/user/user.slice';
import { checkAuth } from '@libs/src/features/auth/auth.slice';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // Get user from auth (JWT token)
    const loadUser = async () => {
      try {
        const result = await dispatch(checkAuth()).unwrap();
        if (result?.id) {
          dispatch(fetchUserById(result.id));
        }
      } catch (error) {
        console.error('Failed to check auth:', error);
      }
    };
    
    loadUser();
  }, [dispatch]);

  // Use actual user data from Redux store
  const user = currentUser ? {
    name: currentUser.username || 'Người dùng',
    email: currentUser.email || '',
    role: currentUser.role?.role_name || 'Quản trị viên',
    avatar: currentUser.employee.photoUrl || '', // Assuming employee has a photoUrl field
  } : undefined;

  return (
    <ClientOnly>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Header */}

        <AdminHeader
          title="Bảng điều khiển quản trị"
          showMenuButton={false}
          user={user}
          notificationCount={5}
          totalUsers={128}
          activeUsers={42}
          systemStatus="healthy"
        />

        {/* Sidebar */}
        <AdminSidebar
          open={true}
          collapsible
        />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: 'background.default',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Offset for fixed header */}
          <Toolbar />
          
          {/* Content Area */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 2, sm: 3 },
              maxWidth: '100%',
              overflow: 'auto',
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </ClientOnly>
  );
}
