'use client';

import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import type { HolidayResponse } from '@libs/shared/types/holiday.type';

interface HolidayCardProps {
  holiday: HolidayResponse;
  onDelete: (id: number) => void;
}

// Generate consistent colors based on month
const getMonthColor = (date: Date): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B739', '#52B788', '#E76F51', '#2A9D8F'
  ];
  return colors[new Date(date).getMonth()];
};

export default function HolidayCard({ holiday, onDelete }: HolidayCardProps) {
  const date = new Date(holiday.date);
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
  const day = date.getDate();
  const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const color = getMonthColor(date);

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        transition: 'all 0.3s ease',
        border: '2px solid transparent',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${color}40`,
          borderColor: color,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Date Badge */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box
            sx={{
              backgroundColor: color,
              color: 'white',
              borderRadius: 2,
              p: 1.5,
              minWidth: 70,
              textAlign: 'center',
              boxShadow: `0 4px 12px ${color}40`,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
              {dayOfWeek}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {day}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.9 }}>
              {monthYear}
            </Typography>
          </Box>

          <Tooltip title="Delete">
            <IconButton
              onClick={() => onDelete(holiday.id)}
              size="small"
              sx={{
                color: 'error.main',
                '&:hover': {
                  backgroundColor: 'error.lighter',
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Holiday Name */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: 'text.primary',
            fontSize: '1rem',
          }}
        >
          {holiday.name}
        </Typography>

        {/* Description */}
        {holiday.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.4,
            }}
          >
            {holiday.description}
          </Typography>
        )}

        {/* Footer Chip */}
        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Chip
            icon={<EventIcon />}
            label={date.toLocaleDateString('vi-VN')}
            size="small"
            sx={{
              backgroundColor: `${color}15`,
              color: color,
              fontWeight: 500,
              '& .MuiChip-icon': {
                color: color,
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
