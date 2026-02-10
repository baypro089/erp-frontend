'use client';

import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { BeachAccess as LeaveIcon } from '@mui/icons-material';

interface LeaveBalanceCardProps {
  remaining: number;
  total: number;
  loading?: boolean;
}

export default function LeaveBalanceCard({
  remaining,
  total,
  loading = false,
}: LeaveBalanceCardProps) {
  const percentage = total > 0 ? (remaining / total) * 100 : 0;
  const isLow = percentage < 30;
  const isMedium = percentage >= 30 && percentage < 60;

  return (
    <Card
      elevation={3}
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
        },
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LeaveIcon sx={{ fontSize: 32, mr: 1.5 }} />
          <Typography variant="h6" fontWeight={600}>
            Quỹ Phép Năm
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
          <Typography
            variant="h2"
            fontWeight={700}
            sx={{ lineHeight: 1, mr: 1 }}
          >
            {loading ? '--' : remaining}
          </Typography>
          <Typography variant="h5" fontWeight={500} color="rgba(255,255,255,0.8)">
            / {total}
          </Typography>
        </Box>

        <Typography variant="body2" color="rgba(255,255,255,0.9)">
          Số ngày phép còn lại
        </Typography>

        {/* Progress bar */}
        <Box
          sx={{
            mt: 2,
            height: 8,
            borderRadius: 4,
            background: 'rgba(255,255,255,0.2)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${percentage}%`,
              background: isLow
                ? '#ff5252'
                : isMedium
                ? '#ffd740'
                : '#69f0ae',
              transition: 'width 0.3s ease',
            }}
          />
        </Box>

        {isLow && (
          <Chip
            label="Sắp hết phép"
            size="small"
            sx={{
              mt: 1.5,
              bgcolor: 'rgba(255, 82, 82, 0.2)',
              color: 'white',
              fontWeight: 600,
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
