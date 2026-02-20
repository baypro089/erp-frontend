'use client';

import { Box, Typography, Paper } from '@mui/material';
import { PageHeader } from '@libs/src/components/common';
import { Category } from '@mui/icons-material';

export default function InventoryProductsPage() {
  return (
    <Box>
      <PageHeader
        title="Sản phẩm"
        subtitle="Quản lý sản phẩm trong kho"
        breadcrumbs={[
          { label: 'Tồn kho', href: '/commercial/inventory' },
          { label: 'Sản phẩm', icon: <Category fontSize="small" /> },
        ]}
      />
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography>Chức năng quản lý sản phẩm đang được phát triển...</Typography>
      </Paper>
    </Box>
  );
}
