'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import { Box, Toolbar, useTheme } from '@mui/material';
import ClientOnly from '@libs/src/components/ClientOnly';
import CommercialSidebar from '@libs/src/components/layout/CommercialSidebar';
import CommercialHeader from '@libs/src/components/layout/CommercialHeader';
import { fetchUserById } from '@libs/src/features/user/user.slice';
import { checkAuth } from '@libs/src/features/auth/auth.slice';

export default function CommercialLayout({
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
  const user = currentUser
    ? {
        name: currentUser.username || 'User',
        email: currentUser.email || '',
        role: currentUser.role?.role_name || 'Commercial',
        avatar: currentUser.employee.photoUrl || '/default-avatar.png',
      }
    : undefined;

  return (
    <ClientOnly>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Header */}
        <CommercialHeader
          title="Commercial POS"
          showMenuButton={false}
          user={user}
          notificationCount={8}
          todaySales={125000000}
          pendingOrders={12}
          lowStockItems={5}
        />

        {/* Sidebar */}
        <CommercialSidebar open={true} />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: theme.palette.background.default,
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
