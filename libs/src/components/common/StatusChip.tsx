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
  | 'error'
  | 'resigned'
  | 'probation'
  | 'maternity'
  | 'terminated';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: StatusType | string | null | undefined;
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
  resigned: { color: 'error', icon: <Info /> },
  probation: { color: 'default', icon: <Info /> },
  maternity: { color: 'default', icon: <Info /> },
  terminated: { color: 'error', icon: <Cancel /> },
};

export default function StatusChip({
  status,
  showIcon = true,
  ...props
}: StatusChipProps) {
  const raw = (status ?? '').toString();

  const normalize = (s: string) =>
    s
      .trim()
      .replace(/[_\-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .toLowerCase();

  const normalized = normalize(raw);

  // map common enum-like or verbose statuses to our statusConfig keys
  const synonyms: Record<string, StatusType> = {
    'maternity leave': 'maternity',
    maternity_leave: 'maternity',
    maternity: 'maternity',
    probation: 'probation',
    resigned: 'resigned',
    terminated: 'terminated',
    draft: 'draft',
    active: 'active',
    inactive: 'inactive',
    pending: 'pending',
    approved: 'approved',
    rejected: 'rejected',
    completed: 'completed',
    cancelled: 'cancelled',
    processing: 'processing',
    info: 'info',
    warning: 'warning',
    success: 'success',
    error: 'error',
  };

  let key: StatusType | undefined = undefined;
  // try exact match first
  if (synonyms[normalized]) key = synonyms[normalized];

  // try matching tokens
  if (!key) {
    for (const k of Object.keys(synonyms)) {
      if (normalized.includes(k)) {
        key = synonyms[k];
        break;
      }
    }
  }

  // fallback to first word
  if (!key) {
    const first = normalized.split(' ')[0] as StatusType;
    key = (first in statusConfig ? first : undefined) as StatusType | undefined;
  }

  const config = (key && statusConfig[key]) || { color: 'default' as ChipProps['color'] };

  const titleCase = (s: string) =>
    s
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

  const label = raw ? titleCase(raw) : '-';

  return (
    <Chip
      label={label}
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
