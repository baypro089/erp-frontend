import { Status } from '@libs/shared/enums/employee-status.enum';

// Returns a status string compatible with StatusChip's StatusType
export function employeeStatusToChip(status?: Status | string | null): string {
  if (!status) return 'draft';

  const s = String(status).trim();

  switch (s) {
    case Status.ACTIVE:
    case 'ACTIVE':
      return 'active';
    case Status.DRAFT:
    case 'DRAFT':
      return 'pending';
    case Status.MATERNITY_LEAVE:
    case 'MATERNITY_LEAVE':
    case 'MATERNITY':
      return 'maternity';
    case Status.RESIGNED:
    case 'RESIGNED':
      return 'resigned';
    case Status.PROBATION:
    case 'PROBATION':
      return 'probation';
    case Status.TERMINATED:
    case 'TERMINATED':
      return 'terminated';
    default:
      return s.toLowerCase();
  }
}

export default employeeStatusToChip;
