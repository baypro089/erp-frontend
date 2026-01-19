import { PagedResult } from "./pagedResult.type"; 

export type DepartmentResponse = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type DepartmentResponseList = {
  items: DepartmentResponse[];
  total: number;
};

export type PagedAndFilteredDepartment = PagedResult<DepartmentResponse>;
