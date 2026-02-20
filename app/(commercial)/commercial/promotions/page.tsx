'use client';

import { Box, Typography, Paper } from '@mui/material';
import { PageHeader } from '@libs/src/components/common';
import { LocalOffer } from '@mui/icons-material';

export default function PromotionsPage() {
  return (
    <Box>
      <PageHeader
        title="Khuyến mãi"
        subtitle="Quản lý chương trình khuyến mãi"
        breadcrumbs={[
          { label: 'Khuyến mãi', icon: <LocalOffer fontSize="small" /> },
        ]}
      />
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography>Chức năng quản lý khuyến mãi đang được phát triển...</Typography>
      </Paper>
    </Box>
  );
}
