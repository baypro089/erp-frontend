import { LeaveRequestStatus } from '../enums/leave-request-status.enum';
import { PagedResult } from './pagedResult.type';

export type LeaveRequestResponse = {
  id: string;
  employeeId: string;
  startTime: Date;
  endTime: Date;
  reason: string;
  status: LeaveRequestStatus;
  approverId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type LeaveRequestResponseList = {
  items: LeaveRequestResponse[];
  total: number;
};

export type PagedAndFilteredLeaveRequest = PagedResult<LeaveRequestResponse>;
