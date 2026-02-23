'use client';

import { Box } from '@mui/material';
import { PageHeader } from '@libs/src/components/common';
import { QrCode } from '@mui/icons-material';
import SerialLookup from '@libs/src/components/products/SerialLookup';

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
      <Box sx={{ mt: 3 }}>
        <SerialLookup />
      </Box>
    </Box>
  );
}
