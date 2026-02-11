'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { DataTable, StatusChip, Column } from '@libs/src/components/common';
import { fetchDeletedEmployees } from '@libs/src/features/employee/employee.slice';
import type { EmployeeTableResponse } from '@libs/shared/types/employees.type';
import { Status } from '@libs/shared/enums/employee-status.enum';

interface DeletedEmployeesDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function DeletedEmployeesDialog({ open, onClose }: DeletedEmployeesDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { deletedEmployees, deletedTotalCount, deletedLoading } = useSelector(
    (state: RootState) => state.employee
  );

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (open) {
      dispatch(
        fetchDeletedEmployees({
          page: page + 1,
          pageSize: rowsPerPage,
        })
      );
    }
  }, [dispatch, open, page, rowsPerPage]);

  const columns: Column<EmployeeTableResponse>[] = [
    {
      id: 'employeeCode',
      label: 'Employee Code',
      minWidth: 140,
      format: (value) => (
        <Typography variant="body2" fontWeight={500} color="primary">
          {value}
        </Typography>
      ),
    },
    {
      id: 'fullName',
      label: 'Full Name',
      minWidth: 200,
      format: (value) => (
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'departmentName',
      label: 'Department',
      minWidth: 150,
      format: (value) => (
        <Chip label={value} size="small" variant="outlined" color="primary" />
      ),
    },
    {
      id: 'positionName',
      label: 'Position',
      minWidth: 150,
      format: (value) => (
        <Chip label={value} size="small" variant="outlined" color="secondary" />
      ),
    },
    {
      id: 'startDate',
      label: 'Start Date',
      minWidth: 120,
      format: (value) => {
        const date = new Date(value as Date);
        return (
          <Typography variant="body2" color="text.secondary">
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Typography>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      align: 'center',
      format: (value) => {
        const statusMap: Record<Status, 'active' | 'pending' | 'maternity' | 'resigned' | 'probation'> = {
          [Status.ACTIVE]: 'active',
          [Status.DRAFT]: 'pending',
          [Status.MATERNITY_LEAVE]: 'maternity',
          [Status.RESIGNED]: 'resigned',
          [Status.PROBATION]: 'probation',
        };
        return <StatusChip status={statusMap[value as Status]} showIcon />;
      },
    },
    {
      id: 'updatedAt',
      label: 'Deleted At',
      minWidth: 120,
      format: (value) => {
        const date = new Date(value as Date);
        return (
          <Typography variant="body2" color="text.secondary">
            {date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Typography>
        );
      },
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Deleted Employees</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DataTable
          columns={columns}
          data={deletedEmployees}
          loading={deletedLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={deletedTotalCount}
          onPageChange={setPage}
          onRowsPerPageChange={(value) => {
            setRowsPerPage(value);
            setPage(0);
          }}
          rowKey="id"
          emptyMessage="No deleted employees found"
        />
      </DialogContent>
    </Dialog>
  );
}
