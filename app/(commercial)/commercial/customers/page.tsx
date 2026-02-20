'use client';

import { Box, Typography, Paper } from '@mui/material';
import { PageHeader } from '@libs/src/components/common';
import { People } from '@mui/icons-material';

export default function CustomersPage() {
  return (
    <Box>
      <PageHeader
        title="Khách hàng"
        subtitle="Quản lý thông tin khách hàng"
        breadcrumbs={[
          { label: 'Khách hàng', icon: <People fontSize="small" /> },
        ]}
      />
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography>Chức năng quản lý khách hàng đang được phát triển...</Typography>
      </Paper>
    </Box>
  );
}
