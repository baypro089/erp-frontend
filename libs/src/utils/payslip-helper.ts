// utils/payrollHelper.ts
import { PayslipResponse } from "@libs/shared/types/payslips.type";
import { SalaryComponentResponse } from "@libs/shared/types/salary-component.type";

export const groupPayslipItems = (payslip: PayslipResponse, components: SalaryComponentResponse[]) => {
  const earnings: Array<{ name: string; amount: number; code: string }> = [];
  const deductions: Array<{ name: string; amount: number; code: string }> = [];

  // Duyệt qua danh mục (để đảm bảo thứ tự hiển thị đẹp)
  components.forEach((comp) => {
    const amount = payslip.details[comp.code]; // Lấy tiền từ JSON details
    
    // Chỉ xử lý nếu có tiền (lớn hơn 0)
    if (amount && amount > 0) {
      if (comp.type === 'EARNING') {
        earnings.push({ name: comp.name, amount, code: comp.code });
      } else {
        deductions.push({ name: comp.name, amount, code: comp.code });
      }
    }
  });

  return { earnings, deductions };
};