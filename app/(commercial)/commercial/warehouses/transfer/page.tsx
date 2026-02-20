'use client';

import { Box, Typography, Paper } from '@mui/material';
import { PageHeader } from '@libs/src/components/common';
import { LocalShipping } from '@mui/icons-material';

export default function StockTransferPage() {
  return (
    <Box>
      <PageHeader
        title="Chuyển kho"
        subtitle="Quản lý chuyển kho hàng hóa"
        breadcrumbs={[
          { label: 'Kho hàng', href: '/commercial/warehouses' },
          { label: 'Chuyển kho', icon: <LocalShipping fontSize="small" /> },
        ]}
      />
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography>Chức năng chuyển kho đang được phát triển...</Typography>
      </Paper>
    </Box>
  );
}
