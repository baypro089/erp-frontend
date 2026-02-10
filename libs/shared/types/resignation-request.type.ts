import { EmployeeResponse } from "./employees.type";
import { PagedResult } from "./pagedResult.type";
import { UserResponse } from "./users.type";

type ResighnationRequestResponse = {
    id: string;
    employee: EmployeeResponse;
    approver?: UserResponse;
    summitDate: Date;
    desiredLastDay: Date;
    approvedLastDay?: Date;
    status: string;
    hrNote?: string;
    reason: string;
    handoverNote?: string;
    createdAt: Date;
    updatedAt: Date;
}

type CreateResignationRequest = {
    employeeId: string;
    desiredLastDay: Date;
    reason: string;
    handoverNote: string;
}

type ResighnationRequestListResponse = PagedResult<ResighnationRequestResponse>;

export type {
    ResighnationRequestResponse,
    CreateResignationRequest,
    ResighnationRequestListResponse
};