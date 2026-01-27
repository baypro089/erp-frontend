'use client';

import { useState } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import ClientOnly from '@libs/src/components/ClientOnly';
import AdminSidebar from '@libs/src/components/layout/AdminSidebar';
import AdminHeader from '@libs/src/components/layout/AdminHeader';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Mock user data - replace with actual user data from your auth system
  const user = {
    name: 'Admin User',
    email: 'admin@erp.com',
  };

  return (
    <ClientOnly>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Header */}
        <AdminHeader
          onMenuClick={handleSidebarToggle}
          title="Admin Dashboard"
          showMenuButton={isMobile}
          user={user}
          notificationCount={5}
        />

        {/* Sidebar */}
        <AdminSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
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
