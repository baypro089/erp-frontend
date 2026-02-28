'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@libs/src/store';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  fetchManagerReport,
  clearError,
} from '@libs/src/features/hr-report/hr-report.slice';
import * as XLSX from 'xlsx';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function HrReportsPage() {
  const theme = useTheme();
  const currentDate = new Date();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { report: reportData, loading, error } = useSelector(
    (state: RootState) => state.hrReport
  );
  
  // Filters
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');

  // Fetch report data when filters change
  useEffect(() => {
    const filter = {
      year: selectedYear,
      ...(selectedMonth !== 'all' && { month: selectedMonth as number }),
    };
    
    dispatch(fetchManagerReport(filter));
  }, [dispatch, selectedYear, selectedMonth]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Format currency
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(numValue);
  };

  // Export Excel function
  const handleExportExcel = () => {
    if (!reportData?.payrollDetails || reportData.payrollDetails.length === 0) {
      alert('Không có dữ liệu để xuất');
      return;
    }

    // Prepare data for Excel
    const excelData = reportData.payrollDetails.map((item) => ({
      'Mã NV': item.employee?.employeeCode || '',
      'Họ Tên': item.employee?.fullName || '',
      'Phòng Ban': item.employee?.department?.name || '',
      'Tháng': item.month || '',
      'Năm': item.year || '',
      'Lương Cơ Bản': typeof item.baseSalary === 'number' ? item.baseSalary : parseFloat(item.baseSalary || '0'),
      'Phụ Cấp': item.details?.allowance || 0,
      'Thưởng': item.details?.bonus || 0,
      'Khấu Trừ': item.details?.deduction || 0,
      'Thực Nhận': typeof item.finalSalary === 'number' ? item.finalSalary : parseFloat(item.finalSalary || '0'),
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bảng Lương');

    // Auto-size columns
    const maxWidth = 20;
    const wscols = [
      { wch: 10 }, // Mã NV
      { wch: 25 }, // Họ Tên
      { wch: 20 }, // Phòng Ban
      { wch: 8 },  // Tháng
      { wch: 8 },  // Năm
      { wch: 15 }, // Lương Cơ Bản
      { wch: 15 }, // Phụ Cấp
      { wch: 15 }, // Thưởng
      { wch: 15 }, // Khấu Trừ
      { wch: 15 }, // Thực Nhận
    ];
    ws['!cols'] = wscols;

    // Export file
    const fileName = `BangLuong_${selectedYear}${selectedMonth !== 'all' ? `_Thang${selectedMonth}` : ''}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Prepare chart data for new hires (monthly)
  const newHiresChartData = reportData?.headcount.newHires.map((item) => {
    const [year, month] = item.month.split('-');
    return {
      month: `T${parseInt(month)}`,
      count: parseInt(item.count),
    };
  }) || [];

  // Prepare chart data for payroll summary by department
  const payrollChartData = reportData?.payrollSummary.map((item, index) => ({
    name: item.department,
    value: parseFloat(item.totalFinalSalary),
    color: COLORS[index % COLORS.length],
  })) || [];

  // Generate year options (last 5 years)
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Báo Cáo Nhân Sự & Quỹ Lương
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tổng quan tình hình nhân sự và chi phí lương theo kỳ
        </Typography>
      </Box>

      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Year Selector */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Năm</InputLabel>
            <Select
              value={selectedYear}
              label="Năm"
              onChange={(e) => setSelectedYear(e.target.value as number)}
            >
              {yearOptions.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Month Selector */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Tháng</InputLabel>
            <Select
              value={selectedMonth}
              label="Tháng"
              onChange={(e) => setSelectedMonth(e.target.value as number | 'all')}
            >
              <MenuItem value="all">Cả năm</MenuItem>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <MenuItem key={month} value={month}>
                  Tháng {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 1 }} />

          {/* Export Button */}
          <Button
            variant="contained"
            color="success"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportExcel}
            disabled={!reportData?.payrollDetails || reportData.payrollDetails.length === 0}
          >
            Xuất Excel Bảng Lương
          </Button>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Report Content */}
      {!loading && reportData && (
        <Box>
          {/* Period Display */}
          <Card sx={{ mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Kỳ báo cáo: {reportData.period}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng nhân sự đang hoạt động: <strong>{reportData.headcount.totalActive}</strong> người
              </Typography>
            </CardContent>
          </Card>

          {/* Block 1: New Hires Chart (Monthly) */}
          {selectedMonth === 'all' && newHiresChartData.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PeopleIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Tình hình Nhân sự Mới Gia Nhập
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={newHiresChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill={theme.palette.primary.main} name="Số người mới" />
                </BarChart>
              </ResponsiveContainer>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                Biểu đồ thể hiện số lượng nhân sự mới gia nhập qua từng tháng trong năm
              </Typography>
            </Paper>
          )}

          {/* Block 2: Payroll Summary by Department */}
          {payrollChartData.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingUpIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Tình hình Quỹ Lương theo Phòng Ban
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {/* Pie Chart */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={payrollChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${percent ? (percent * 100).toFixed(1) : 0}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {payrollChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => {
                          const numValue = typeof value === 'number' ? value : 0;
                          return formatCurrency(numValue);
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Grid>

                {/* Summary Table */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Phòng Ban</strong></TableCell>
                          <TableCell align="right"><strong>Tổng Lương</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.payrollSummary.map((dept, index) => (
                          <TableRow key={dept.departmentId}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: COLORS[index % COLORS.length],
                                    mr: 1,
                                  }}
                                />
                                {dept.department}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(dept.totalFinalSalary)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Block 3: Payroll Details Table */}
          {reportData.payrollDetails && reportData.payrollDetails.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Bảng Chi Tiết Lương
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                      <TableCell><strong>Mã NV</strong></TableCell>
                      <TableCell><strong>Họ Tên</strong></TableCell>
                      <TableCell><strong>Phòng Ban</strong></TableCell>
                      <TableCell align="center"><strong>Tháng</strong></TableCell>
                      <TableCell align="right"><strong>Lương Cơ Bản</strong></TableCell>
                      <TableCell align="right"><strong>Phụ Cấp</strong></TableCell>
                      <TableCell align="right"><strong>Thưởng</strong></TableCell>
                      <TableCell align="right"><strong>Khấu Trừ</strong></TableCell>
                      <TableCell align="right"><strong>Thực Nhận</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.payrollDetails.map((row, index) => (
                      <TableRow
                        key={`${row.employee?.id}-${row.month}-${row.year}`}
                        sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
                      >
                        <TableCell>{row.employee?.employeeCode || '-'}</TableCell>
                        <TableCell>{row.employee?.fullName || '-'}</TableCell>
                        <TableCell>{row.employee?.department?.name || '-'}</TableCell>
                        <TableCell align="center">{row.month}/{row.year}</TableCell>
                        <TableCell align="right">{formatCurrency(row.baseSalary)}</TableCell>
                        <TableCell align="right">{formatCurrency(row.details?.allowance || 0)}</TableCell>
                        <TableCell align="right">{formatCurrency(row.details?.bonus || 0)}</TableCell>
                        <TableCell align="right" sx={{ color: theme.palette.error.main }}>
                          {formatCurrency(row.details?.deduction || 0)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                          {formatCurrency(row.finalSalary)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Empty State */}
          {(!reportData.payrollDetails || reportData.payrollDetails.length === 0) && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Không có dữ liệu bảng lương cho kỳ này
              </Typography>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
}
