// Example usage of CRUD components for a Department page

'use client';

import { useState } from 'react';
import { Box, TextField, Grid } from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  BusinessCenter,
} from '@mui/icons-material';
import {
  DataTable,
  FormDialog,
  DeleteConfirmDialog,
  PageHeader,
  FilterBar,
  StatusChip,
  EmptyState,
  LoadingOverlay,
  Column,
  FilterOption,
} from '@libs/src/components/common';

// Sample data type
interface Department {
  id: number;
  name: string;
  code: string;
  manager: string;
  employeeCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function CRUDExample() {
  // State management
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Department[]>([
    {
      id: 1,
      name: 'IT Department',
      code: 'IT',
      manager: 'John Doe',
      employeeCount: 25,
      status: 'active',
      createdAt: '2024-01-15',
    },
    {
      id: 2,
      name: 'HR Department',
      code: 'HR',
      manager: 'Jane Smith',
      employeeCount: 10,
      status: 'active',
      createdAt: '2024-01-16',
    },
    {
      id: 3,
      name: 'Finance',
      code: 'FIN',
      manager: 'Bob Johnson',
      employeeCount: 8,
      status: 'inactive',
      createdAt: '2024-01-17',
    },
  ]);

  // Dialog states
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Department | null>(null);
  const [formData, setFormData] = useState<Partial<Department>>({});

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter states
  const [searchValue, setSearchValue] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Selected rows for bulk actions
  const [selectedRows, setSelectedRows] = useState<Department[]>([]);

  // Define table columns
  const columns: Column<Department>[] = [
    { id: 'code', label: 'Code', minWidth: 100 },
    { id: 'name', label: 'Department Name', minWidth: 170 },
    { id: 'manager', label: 'Manager', minWidth: 150 },
    {
      id: 'employeeCount',
      label: 'Employees',
      minWidth: 100,
      align: 'center',
      format: (value) => value.toLocaleString(),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      align: 'center',
      format: (value) => <StatusChip status={value} />,
    },
    {
      id: 'createdAt',
      label: 'Created Date',
      minWidth: 120,
      format: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Define filters
  const filters: FilterOption[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
      value: filterStatus,
    },
  ];

  // Handlers
  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({});
    setOpenForm(true);
  };

  const handleEdit = (row: Department) => {
    setSelectedItem(row);
    setFormData(row);
    setOpenForm(true);
  };

  const handleDelete = (row: Department) => {
    setSelectedItem(row);
    setOpenDelete(true);
  };

  const handleFormSubmit = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      if (selectedItem) {
        // Update existing
        setData((prev) =>
          prev.map((item) =>
            item.id === selectedItem.id ? { ...item, ...formData } : item
          )
        );
      } else {
        // Add new
        const newItem = {
          ...formData,
          id: Math.max(...data.map((d) => d.id)) + 1,
          createdAt: new Date().toISOString(),
        } as Department;
        setData((prev) => [...prev, newItem]);
      }
      setLoading(false);
      setOpenForm(false);
    }, 1000);
  };

  const handleDeleteConfirm = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setData((prev) => prev.filter((item) => item.id !== selectedItem?.id));
      setLoading(false);
      setOpenDelete(false);
    }, 1000);
  };

  const handleExport = () => {
    console.log('Export data:', data);
  };

  const handleImport = () => {
    console.log('Import data');
  };

  const handleClearFilters = () => {
    setSearchValue('');
    setFilterStatus('');
  };

  // Filter data based on search and filters
  const filteredData = data.filter((item) => {
    const matchSearch =
      searchValue === '' ||
      item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.code.toLowerCase().includes(searchValue.toLowerCase());
    const matchStatus = filterStatus === '' || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const activeFiltersCount =
    (searchValue ? 1 : 0) + (filterStatus ? 1 : 0);

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title="Departments"
        subtitle="Manage organization departments and their information"
        breadcrumbs={[
          { label: 'Admin', href: '/' },
          { label: 'Departments', icon: <BusinessCenter fontSize="small" /> },
        ]}
        actions={[
          {
            label: 'Import',
            onClick: handleImport,
            icon: <UploadIcon />,
            variant: 'outlined',
          },
          {
            label: 'Export',
            onClick: handleExport,
            icon: <DownloadIcon />,
            variant: 'outlined',
          },
          {
            label: 'Add Department',
            onClick: handleAdd,
            icon: <AddIcon />,
            variant: 'contained',
          },
        ]}
        tags={[{ label: `${data.length} Total` }]}
      />

      {/* Filter Bar */}
      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search departments..."
        filters={filters}
        onFilterChange={(filterId, value) => {
          if (filterId === 'status') setFilterStatus(value);
        }}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={filteredData.length}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setPage(0);
        }}
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No departments found"
      />

      {/* Form Dialog */}
      <FormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        title={selectedItem ? 'Edit Department' : 'Add New Department'}
        subtitle={
          selectedItem
            ? 'Update department information'
            : 'Create a new department'
        }
        loading={loading}
      >
        <Grid container spacing={2}>
          <Grid>
            <TextField
              fullWidth
              label="Department Code"
              value={formData.code || ''}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </Grid>
          <Grid>
            <TextField
              fullWidth
              label="Department Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </Grid>
          <Grid>
            <TextField
              fullWidth
              label="Manager"
              value={formData.manager || ''}
              onChange={(e) =>
                setFormData({ ...formData, manager: e.target.value })
              }
            />
          </Grid>
          <Grid>
            <TextField
              fullWidth
              type="number"
              label="Employee Count"
              value={formData.employeeCount || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  employeeCount: parseInt(e.target.value),
                })
              }
            />
          </Grid>
          <Grid>
            <TextField
              fullWidth
              select
              label="Status"
              value={formData.status || 'active'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'active' | 'inactive',
                })
              }
              SelectProps={{ native: true }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </TextField>
          </Grid>
        </Grid>
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedItem?.name}
        loading={loading}
      />

      {/* Loading Overlay */}
      <LoadingOverlay open={loading} message="Processing..." />
    </Box>
  );
}
