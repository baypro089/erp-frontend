'use client';

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Checkbox,
  IconButton,
  Tooltip,
  Typography,
  Skeleton,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useState } from 'react';

export interface Column<T = any> {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  hidden?: boolean;
}

export interface DataTableAction<T = any> {
  icon: React.ReactNode;
  label: string;
  onClick: (row: T) => void;
  color?:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';
  hidden?: (row: T) => boolean;
}

interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  page?: number;
  rowsPerPage?: number;
  totalRows?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selected: T[]) => void;
  actions?: DataTableAction<T>[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  rowKey?: string;
  emptyMessage?: string;
  dense?: boolean;
  stickyHeader?: boolean;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  page = 0,
  rowsPerPage = 10,
  totalRows,
  onPageChange,
  onRowsPerPageChange,
  onSort,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  actions,
  onEdit,
  onDelete,
  onView,
  rowKey = 'id',
  emptyMessage = 'No data available',
  dense = false,
  stickyHeader = true,
}: DataTableProps<T>) {
  const theme = useTheme();
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setOrder(newOrder);
    setOrderBy(columnId);
    onSort?.(columnId, newOrder);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onSelectionChange?.(data);
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (row: T) => {
    const selectedIndex = selectedRows.findIndex(
      (item) => item[rowKey] === row[rowKey]
    );
    let newSelected: T[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedRows, row];
    } else {
      newSelected = selectedRows.filter(
        (item) => item[rowKey] !== row[rowKey]
      );
    }

    onSelectionChange?.(newSelected);
  };

  const isSelected = (row: T) =>
    selectedRows.some((item) => item[rowKey] === row[rowKey]);

  const visibleColumns = columns.filter((col) => !col.hidden);
  const hasActions = Boolean(onEdit || onDelete || onView || actions?.length);

  const LoadingRow = () => (
    <TableRow>
      {selectable && (
        <TableCell padding="checkbox">
          <Skeleton variant="rectangular" width={18} height={18} />
        </TableCell>
      )}
      {visibleColumns.map((column) => (
        <TableCell key={column.id}>
          <Skeleton variant="text" />
        </TableCell>
      ))}
      {hasActions && (
        <TableCell>
          <Skeleton variant="text" />
        </TableCell>
      )}
    </TableRow>
  );

  return (
    <Paper elevation={0} sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedRows.length > 0 && selectedRows.length < data.length
                    }
                    checked={data.length > 0 && selectedRows.length === data.length}
                    onChange={handleSelectAll}
                    disabled={loading || data.length === 0}
                  />
                </TableCell>
              )}
              {visibleColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: theme.palette.background.paper,
                  }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {hasActions && (
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    backgroundColor: theme.palette.background.paper,
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, index) => (
                <LoadingRow key={index} />
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    visibleColumns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)
                  }
                  align="center"
                >
                  <Box py={6}>
                    <Typography variant="body2" color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                const isItemSelected = isSelected(row);
                return (
                  <TableRow
                    hover
                    key={row[rowKey] || index}
                    selected={isItemSelected}
                    sx={{
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onChange={() => handleSelectRow(row)}
                        />
                      </TableCell>
                    )}
                    {visibleColumns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align || 'left'}>
                          {column.format ? column.format(value, row) : value}
                        </TableCell>
                      );
                    })}
                    {hasActions && (
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          {onView && (
                            <Tooltip title="View">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => onView(row)}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onEdit && (
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => onEdit(row)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onDelete && (
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => onDelete(row)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {actions?.map((action, idx) => {
                            if (action.hidden?.(row)) return null;
                            return (
                              <Tooltip key={idx} title={action.label}>
                                <IconButton
                                  size="small"
                                  color={action.color}
                                  onClick={() => action.onClick(row)}
                                >
                                  {action.icon}
                                </IconButton>
                              </Tooltip>
                            );
                          })}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {(onPageChange || onRowsPerPageChange) && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={totalRows || data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => onPageChange?.(newPage)}
          onRowsPerPageChange={(event) =>
            onRowsPerPageChange?.(parseInt(event.target.value, 10))
          }
        />
      )}
    </Paper>
  );
}
