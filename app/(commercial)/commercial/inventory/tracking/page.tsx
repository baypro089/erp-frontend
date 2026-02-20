'use client';

import { Box, Typography, Paper } from '@mui/material';
import { PageHeader } from '@libs/src/components/common';
import { QrCode } from '@mui/icons-material';

export default function SerialTrackingPage() {
  return (
    <Box>
      <PageHeader
        title="Theo dõi Serial"
        subtitle="Tra cứu và theo dõi Serial/IMEI"
        breadcrumbs={[
          { label: 'Tồn kho', href: '/commercial/inventory' },
          { label: 'Theo dõi Serial', icon: <QrCode fontSize="small" /> },
        ]}
      />
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography>Chức năng theo dõi Serial đang được phát triển...</Typography>
      </Paper>
    </Box>
  );
}
