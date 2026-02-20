'use client';

import { Box, Typography, Paper } from '@mui/material';
import { PageHeader } from '@libs/src/components/common';
import { ShoppingCart } from '@mui/icons-material';

export default function OrdersPage() {
  return (
    <Box>
      <PageHeader
        title="Đơn hàng"
        subtitle="Quản lý đơn hàng"
        breadcrumbs={[
          { label: 'Đơn hàng', icon: <ShoppingCart fontSize="small" /> },
        ]}
      />
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography>Chức năng quản lý đơn hàng đang được phát triển...</Typography>
      </Paper>
    </Box>
  );
}
