'use client';

import { Box, Typography, Paper } from '@mui/material';
import { PageHeader } from '@libs/src/components/common';
import { Receipt } from '@mui/icons-material';

export default function InvoicesPage() {
  return (
    <Box>
      <PageHeader
        title="Hóa đơn"
        subtitle="Quản lý hóa đơn"
        breadcrumbs={[
          { label: 'Hóa đơn', icon: <Receipt fontSize="small" /> },
        ]}
      />
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography>Chức năng quản lý hóa đơn đang được phát triển...</Typography>
      </Paper>
    </Box>
  );
}
