'use client';

import { Box, Typography, Paper } from '@mui/material';
import { PageHeader } from '@libs/src/components/common';
import { Inventory } from '@mui/icons-material';

export default function InventoryReportPage() {
  return (
    <Box>
      <PageHeader
        title="Báo cáo Tồn kho"
        subtitle="Phân tích trạng thái tồn kho"
        breadcrumbs={[
          { label: 'Báo cáo', href: '/commercial/reports' },
          { label: 'Tồn kho', icon: <Inventory fontSize="small" /> },
        ]}
      />
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography>Chức năng báo cáo tồn kho đang được phát triển...</Typography>
      </Paper>
    </Box>
  );
}
