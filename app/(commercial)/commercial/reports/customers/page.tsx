'use client';

import { Box, Typography, Paper } from '@mui/material';
import { PageHeader } from '@libs/src/components/common';
import { People } from '@mui/icons-material';

export default function CustomerReportPage() {
  return (
    <Box>
      <PageHeader
        title="Báo cáo Khách hàng"
        subtitle="Phân tích hành vi và xu hướng khách hàng"
        breadcrumbs={[
          { label: 'Báo cáo', href: '/commercial/dashboards' },
          { label: 'Khách hàng', icon: <People fontSize="small" /> },
        ]}
      />
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography>Chức năng báo cáo khách hàng đang được phát triển...</Typography>
      </Paper>
    </Box>
  );
}
