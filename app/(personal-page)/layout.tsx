'use client';

import { Box } from '@mui/material';
import { useState } from 'react';
import PersonalPageHeader from '@libs/src/components/layout/PersonalPageHeader';
import PersonalPageSidebar from '@libs/src/components/layout/PersonalPageSidebar';

export default function PersonalPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <PersonalPageHeader onMenuClick={handleDrawerToggle} />
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
