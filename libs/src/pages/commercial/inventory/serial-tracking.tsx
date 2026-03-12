'use client';

import { Box } from '@mui/material';
import { PageHeader, PermissionGuard } from '@libs/src/components/common';
import { QrCode } from '@mui/icons-material';
import SerialLookup from '@libs/src/components/products/SerialLookup';
import { PERMISSIONS } from '@libs/shared/constants/permissions.constant';

export default function SerialTrackingPage() {
  return (
    <PermissionGuard 
      permission={PERMISSIONS.PRODUCT_SERIAL.VIEW}
      fallbackPath="/commercial/inventory"
    >
      <SerialTrackingPageContent />
    </PermissionGuard>
  );
}

function SerialTrackingPageContent() {
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
