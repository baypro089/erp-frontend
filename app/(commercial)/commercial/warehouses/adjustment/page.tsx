'use client';

import { Box, Typography, Paper } from '@mui/material';
import { PageHeader } from '@libs/src/components/common';
import { Inventory2 } from '@mui/icons-material';

export default function StockAdjustmentPage() {
  return (
    <Box>
      <PageHeader
        title="Kiểm kê"
        subtitle="Kiểm kê và điều chỉnh tồn kho"
        breadcrumbs={[
          { label: 'Kho hàng', href: '/commercial/warehouses' },
          { label: 'Kiểm kê', icon: <Inventory2 fontSize="small" /> },
        ]}
      />
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography>Chức năng kiểm kê đang được phát triển...</Typography>
      </Paper>
    </Box>
  );
}
