import { EmployeeResponse } from "./employees.type";
import { RoleResponse } from "./roles.type";
import { PagedResult } from "./pagedResult.type";
import { UserStatus } from "../enums/user-status.enum";

type CreateUserDto = {
    username: string;
    password: string;
    email: string;
    role_code: string;
}

type UserResponse = {
    id: string;
    username: string;
    email: string;
    role: RoleResponse;
    employee: EmployeeResponse;
    isActive: boolean; // dòng này là thuộc tính thừa, không cần hiển thị ra ngoài
    createdAt: Date;
    updatedAt: Date;
    status?: UserStatus;
    lastLogin?: Date | null;
}

type UpdateUserDto = {
    email?: string;
    roleCode?: string;
    status?: UserStatus;
}

type UserResponseList = UserResponse[];

type UserFilterAndPaged = PagedResult<UserResponse>;

export type { CreateUserDto, UserResponse, UserResponseList, UserFilterAndPaged, UpdateUserDto };