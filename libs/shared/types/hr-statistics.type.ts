export interface IHrDashboard {
  // 1. Chỉ số nhân sự cơ bản
  headcount: {
    totalActive: number;     // Tổng nhân sự đang làm việc
    newHires: number;        // Số người mới tuyển trong tháng
    resigned: number;        // Số người nghỉ việc trong tháng
  };

  // 2. Tình hình Nghỉ phép / Chấm công
  attendance: {
    onLeaveToday: number;    // Số người đang nghỉ phép HÔM NAY
    absentEmployees: Array<{ // Danh sách nhân viên vắng mặt hôm nay
      id: number;
      fullName: string;
    }>;
    pendingRequests: number; // Đơn xin nghỉ phép đang chờ duyệt
  };

  // 3. Quỹ lương (Payroll)
  payroll: {
    totalEstimated: number;  // Ước tính quỹ lương tháng này
    totalPaid: number;       // Đã thanh toán (Chốt)
    percentagePaid: number;  // Phần trăm đã thanh toán
  };

  // 4. Cơ cấu nhân sự theo phòng ban (Pie Chart)
  departmentDistribution: Array<{
    departmentName: string;
    count: number;
    percentage: number;  // Phần trăm so với tổng nhân sự
  }>;

  // 5. Sự kiện sắp tới (Events)
  upcomingEvents: {
    birthdays: Array<{
      employeeId: number;
      fullName: string;
      birthdayDate: string;
      daysUntil: number;
    }>;
    probationEndings: Array<{
      employeeId: number;
      fullName: string;
      endDate: string;
      daysUntil: number;
    }>;
  };
}

export type HrDashboardFilterDto = {
  month?: string; // VD: 2026-02
}