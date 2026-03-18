'use client';

import { Box } from '@mui/material';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import { checkAuth } from '@libs/src/features/auth/auth.slice';
import PersonalPageHeader from '@libs/src/components/layout/PersonalPageHeader';
import PersonalPageSidebar from '@libs/src/components/layout/PersonalPageSidebar';
import { fetchUserById } from '@libs/src/features/user/user.slice';

export default function PersonalPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { isAuth, authChecked } = useSelector((state: RootState) => state.auth);
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

  useEffect(() => {
    if (authChecked && !isAuth) {
      window.location.href = '/auth/login';
    }
  }, [authChecked, isAuth]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Use actual user data from Redux store
  const user = currentUser ? {
    name: currentUser.username || 'Chưa cập nhật',
    email: currentUser.email || 'Chưa cập nhật',
    role: currentUser.role?.role_name || 'Chưa cập nhật',
    avatar: currentUser.employee.photoUrl || '', // Assuming employee has a photoUrl field
  } : undefined;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <PersonalPageHeader onMenuClick={handleDrawerToggle} user={user} />
      <PersonalPageSidebar
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: { sm: '240px' },
          backgroundColor: (theme) => theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
