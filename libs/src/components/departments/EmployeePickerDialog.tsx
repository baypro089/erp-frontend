'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Typography,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import employeeService from '@libs/src/features/employee/employee.service';
import type { EmployeeTableResponse } from '@libs/shared/types/employees.type';
import { Status } from '@libs/shared/enums/employee-status.enum';

interface EmployeePickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (employee: EmployeeTableResponse) => void;
  selectedEmployeeId?: string;
  departmentId?: string;
  departmentName?: string;
}

export default function EmployeePickerDialog({
  open,
  onClose,
  onSelect,
  selectedEmployeeId,
  departmentId,
  departmentName,
}: EmployeePickerDialogProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [employees, setEmployees] = useState<EmployeeTableResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      // Search by employeeCode OR fullName based on whether it looks like a code
      const isCode = /^[A-Za-z0-9-]+$/.test(debouncedSearch) && debouncedSearch.length > 0;
      const result = await employeeService.getEmployeesWithOptional(
        isCode ? debouncedSearch : undefined,
        !isCode && debouncedSearch ? debouncedSearch : undefined,
        departmentId,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        page + 1,
        rowsPerPage
      );
      setEmployees(result.items);
      setTotalCount(result.totalCount);
    } catch {
      setEmployees([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, departmentId, page, rowsPerPage]);

  useEffect(() => {
    if (open) {
      fetchEmployees();
    }
  }, [open, fetchEmployees]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setSearch('');
      setDebouncedSearch('');
      setPage(0);
    }
  }, [open]);

  const handleSelect = (employee: EmployeeTableResponse) => {
    onSelect(employee);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon color="primary" />
          <Typography variant="h6">
            Chọn trưởng phòng{departmentName ? ` - ${departmentName}` : ''}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm theo mã nhân viên hoặc họ tên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Table */}
        <TableContainer sx={{ maxHeight: 360, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Mã NV</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Họ tên</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Phòng ban</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Chức vụ</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Không tìm thấy nhân viên trong phòng ban này
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow
                    key={emp.id}
                    hover
                    selected={emp.id === selectedEmployeeId}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSelect(emp)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {emp.employeeCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{emp.fullName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {emp.departmentName || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {emp.positionName || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={emp.status}
                        size="small"
                        color={emp.status === Status.ACTIVE ? 'success' : 'default'}
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="contained" onClick={() => handleSelect(emp)}>
                        Chọn
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20]}
          labelRowsPerPage="Mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
