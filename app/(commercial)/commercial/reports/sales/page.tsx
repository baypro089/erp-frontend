'use client';

import { Box, Typography, Paper } from '@mui/material';
import { PageHeader } from '@libs/src/components/common';
import { TrendingUp } from '@mui/icons-material';

export default function SalesReportPage() {
  return (
    <Box>
      <PageHeader
        title="Báo cáo Doanh thu"
        subtitle="Phân tích doanh thu và bán hàng"
        breadcrumbs={[
          { label: 'Báo cáo', href: '/commercial/dashboards' },
          { label: 'Doanh thu', icon: <TrendingUp fontSize="small" /> },
        ]}
      />
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography>Chức năng báo cáo doanh thu đang được phát triển...</Typography>
      </Paper>
    </Box>
  );
}
