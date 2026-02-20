'use client';

import { Box, Typography, Paper } from '@mui/material';
import { PageHeader } from '@libs/src/components/common';
import { LocalShipping } from '@mui/icons-material';

export default function ShippingPage() {
  return (
    <Box>
      <PageHeader
        title="Vận chuyển"
        subtitle="Quản lý vận chuyển đơn hàng"
        breadcrumbs={[
          { label: 'Vận chuyển', icon: <LocalShipping fontSize="small" /> },
        ]}
      />
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography>Chức năng quản lý vận chuyển đang được phát triển...</Typography>
      </Paper>
    </Box>
  );
}
