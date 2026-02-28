'use client';

import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Print as PrintIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import type { PayslipResponse } from '@libs/shared/types/payslips.type';
import { useRef } from 'react';

interface YearlyPayslipsDialogProps {
  open: boolean;
  onClose: () => void;
  year: number;
  details: PayslipResponse[];
  totalSalary: number;
  totalBaseSalary: number;
  employeeName?: string;
  employeeCode?: string;
}

export default function YearlyPayslipsDialog({
  open,
  onClose,
  year,
  details,
  totalSalary,
  totalBaseSalary,
  employeeName,
  employeeCode,
}: YearlyPayslipsDialogProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatMonth = (month: number) => {
    return `Tháng ${month.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: '#f5f5f5',
          '@media print': {
            bgcolor: 'white',
            boxShadow: 'none',
          },
        },
      }}
    >
      <Box sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1, '@media print': { display: 'none' } }}>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 4, '@media print': { p: 2 } }}>
        {/* Printable Area */}
        <Box
          ref={printAreaRef}
          id="print-area"
          sx={{
            bgcolor: 'white',
            p: 4,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            '@media print': {
              boxShadow: 'none',
              p: 2,
            },
          }}
        >
          {/* Header Section */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 0.5,
              }}
            >
              CÔNG TY CỔ PHẦN ERP
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 2,
                letterSpacing: 1,
              }}
            >
              BẢNG LƯƠNG NĂM {year}
            </Typography>

            {/* Employee Info */}
            {(employeeName || employeeCode) && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 2 }}>
                {employeeName && (
                  <Typography variant="body1">
                    <strong>Họ và tên:</strong> {employeeName}
                  </Typography>
                )}
                {employeeCode && (
                  <Typography variant="body1">
                    <strong>Mã nhân viên:</strong> {employeeCode}
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Payslips Table */}
          <TableContainer component={Paper} elevation={0} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Tháng</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Ngày công</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Lương cơ bản</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Phụ cấp</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Khấu trừ</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Thực lĩnh</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {details.map((payslip) => {
                  // Calculate allowances and deductions from details
                  const allowances = Object.entries(payslip.details || {})
                    .filter(([key, _]) => !key.includes('DEDUCTION') && !key.includes('TAX'))
                    .reduce((sum, [_, value]) => sum + (value || 0), 0);
                  
                  const deductions = Object.entries(payslip.details || {})
                    .filter(([key, _]) => key.includes('DEDUCTION') || key.includes('TAX'))
                    .reduce((sum, [_, value]) => sum + (value || 0), 0);

                  return (
                    <TableRow key={payslip.id} hover>
                      <TableCell>{formatMonth(payslip.month)}</TableCell>
                      <TableCell align="center">
                        {payslip.actualWorkDays}/{payslip.standardWorkDays}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(payslip.baseSalary)}</TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>
                        {formatCurrency(allowances)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        {formatCurrency(deductions)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(payslip.finalSalary)}
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="caption"
                          sx={{
                            color: payslip.isPaid ? 'success.main' : 'warning.main',
                            fontWeight: 600,
                          }}
                        >
                          {payslip.isPaid ? 'Đã trả' : 'Chưa trả'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* Summary Row */}
                <TableRow sx={{ bgcolor: 'primary.lighter' }}>
                  <TableCell colSpan={2} sx={{ fontWeight: 700, fontSize: '1rem' }}>
                    TỔNG CỘNG
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                    {formatCurrency(totalBaseSalary)}
                  </TableCell>
                  <TableCell colSpan={2} />
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1rem', color: 'primary.main' }}>
                    {formatCurrency(totalSalary)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summary Section */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 3,
              mt: 4,
              p: 3,
              bgcolor: 'grey.50',
              borderRadius: 1,
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tổng lương cơ bản năm {year}:
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {formatCurrency(totalBaseSalary)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tổng lương thực lĩnh năm {year}:
              </Typography>
              <Typography variant="h5" fontWeight={700} color="primary.main">
                {formatCurrency(totalSalary)}
              </Typography>
            </Box>
          </Box>

          {/* Signature Section */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 4,
              mt: 5,
              pt: 3,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Người lập bảng
              </Typography>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                (Ký, họ tên)
              </Typography>
              <Box sx={{ mt: 8 }} />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Giám đốc
              </Typography>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                (Ký, đóng dấu, họ tên)
              </Typography>
              <Box sx={{ mt: 8 }} />
            </Box>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Ngày in: {new Date().toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 4,
          py: 2,
          gap: 1,
          '@media print': {
            display: 'none',
          },
        }}
      >
        <Button onClick={onClose} variant="outlined">
          Đóng
        </Button>
        <Button
          onClick={handlePrint}
          variant="contained"
          startIcon={<PrintIcon />}
        >
          In bảng lương
        </Button>
      </DialogActions>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            @page {
              size: A4 landscape;
              margin: 1cm;
            }
            body * {
              visibility: hidden;
            }
            #print-area, #print-area * {
              visibility: visible;
            }
            #print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}
      </style>
    </Dialog>
  );
}
