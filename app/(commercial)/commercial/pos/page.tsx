'use client';

import { Box, Typography, Paper } from '@mui/material';
import { PageHeader } from '@libs/src/components/common';
import { PointOfSale } from '@mui/icons-material';

export default function POSPage() {
  return (
    <Box>
      <PageHeader
        title="POS - Bán hàng"
        subtitle="Quản lý điểm bán hàng"
        breadcrumbs={[
          { label: 'POS', icon: <PointOfSale fontSize="small" /> },
        ]}
      />
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography>Chức năng POS đang được phát triển...</Typography>
      </Paper>
    </Box>
  );
}
