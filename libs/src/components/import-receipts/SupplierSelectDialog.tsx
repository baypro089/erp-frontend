'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Business as SupplierIcon,
} from '@mui/icons-material';
import { DataTable, Column } from '@libs/src/components/common';
import SupplierFormDialog from '@libs/src/components/suppliers/SupplierFormDialog';
import { fetchSuppliers, createSupplier, clearError } from '@libs/src/features/supplier/supplier.slice';
import type { SupplierResponse, CreateSupplierDTO, UpdateSupplierDTO } from '@libs/shared/types/supplier.type';

interface SupplierSelectDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (supplier: SupplierResponse) => void;
}

export default function SupplierSelectDialog({
  open,
  onClose,
  onSelect,
}: SupplierSelectDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { suppliers, loading, operationLoading, pagedSuppliers } = useSelector(
    (state: RootState) => state.supplier
  );

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(
        fetchSuppliers({
          name: searchQuery || undefined,
          page: page + 1,
          pageSize: rowsPerPage,
        })
      );
    }
  }, [dispatch, open, page, rowsPerPage, searchQuery]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(0);
  };

  const handleSelectSupplier = (supplier: SupplierResponse) => {
    onSelect(supplier);
    onClose();
  };

  const handleAddSupplier = async (data: CreateSupplierDTO | UpdateSupplierDTO, isEdit: boolean) => {
    try {
      const result = await dispatch(createSupplier(data as CreateSupplierDTO)).unwrap();
      setOpenAddDialog(false);
      onSelect(result);
      onClose();
    } catch (error) {
      console.error('Failed to create supplier:', error);
    }
  };

  const columns: Column<SupplierResponse>[] = [
    {
      id: 'name',
      label: 'Tên nhà cung cấp',
      minWidth: 200,
      format: (value) => (
        <Typography variant="body2" fontWeight={500}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'contactPhone',
      label: 'Số điện thoại',
      minWidth: 130,
    },
    {
      id: 'address',
      label: 'Địa chỉ',
      minWidth: 200,
    },
    {
      id: 'isActive',
      label: 'Trạng thái',
      minWidth: 100,
      align: 'center',
      format: (value) => (
        <Typography
          variant="body2"
          sx={{
            color: value ? 'success.main' : 'error.main',
            fontWeight: 500,
          }}
        >
          {value ? 'Hoạt động' : 'Ngưng'}
        </Typography>
      ),
    },
  ];

  const selectAction = {
    icon: <SupplierIcon />,
    label: 'Chọn',
    color: 'primary' as const,
    onClick: handleSelectSupplier,
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, minHeight: '600px' },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SupplierIcon color="primary" />
            <Typography variant="h6" component="div">
              Chọn Nhà Cung Cấp
            </Typography>
          </Box>
          <IconButton edge="end" onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Tìm kiếm theo tên..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              size="small"
              fullWidth
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddDialog(true)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Thêm mới
            </Button>
          </Box>

          <DataTable
            columns={columns}
            data={suppliers}
            loading={loading}
            page={page}
            rowsPerPage={rowsPerPage}
            totalRows={pagedSuppliers?.totalCount || 0}
            onPageChange={setPage}
            onRowsPerPageChange={(value) => {
              setRowsPerPage(value);
              setPage(0);
            }}
            actions={[selectAction]}
            rowKey="id"
            emptyMessage="Không tìm thấy nhà cung cấp"
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Supplier Dialog */}
      <SupplierFormDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onSubmit={handleAddSupplier}
        selectedSupplier={null}
        loading={operationLoading}
      />
    </>
  );
}
