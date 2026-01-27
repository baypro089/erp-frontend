'use client';

import { Chip, ChipProps } from '@mui/material';
import {
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Info,
  Warning,
} from '@mui/icons-material';

export type StatusType =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled'
  | 'draft'
  | 'processing'
  | 'info'
  | 'warning'
  | 'success'
  | 'error';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: StatusType | string;
  showIcon?: boolean;
}

const statusConfig: Record<
  StatusType,
  {
    color: ChipProps['color'];
    icon?: React.ReactElement;
  }
> = {
  active: { color: 'success', icon: <CheckCircle /> },
  inactive: { color: 'default', icon: <Cancel /> },
  pending: { color: 'warning', icon: <HourglassEmpty /> },
  approved: { color: 'success', icon: <CheckCircle /> },
  rejected: { color: 'error', icon: <Cancel /> },
  completed: { color: 'success', icon: <CheckCircle /> },
  cancelled: { color: 'error', icon: <Cancel /> },
  draft: { color: 'default', icon: <Info /> },
  processing: { color: 'info', icon: <HourglassEmpty /> },
  info: { color: 'info', icon: <Info /> },
  warning: { color: 'warning', icon: <Warning /> },
  success: { color: 'success', icon: <CheckCircle /> },
  error: { color: 'error', icon: <Cancel /> },
};

export default function StatusChip({
  status,
  showIcon = true,
  ...props
}: StatusChipProps) {
  const normalizedStatus = status.toLowerCase() as StatusType;
  const config = statusConfig[normalizedStatus] || {
    color: 'default' as ChipProps['color'],
  };

  return (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      color={config.color}
      icon={showIcon ? config.icon : undefined}
      size="small"
      {...props}
      sx={{
        fontWeight: 600,
        ...props.sx,
      }}
    />
  );
}
