import { combineReducers } from 'redux';
import authReducer from '../features/auth/auth.slice';
import roleReducer from '../features/role/role.slice';
import departmentReducer from '../features/department/department.slice';
import positionReducer from '../features/position/position.slice';
import employeeReducer from '../features/employee/employee.slice';
import userReducer from '../features/user/user.slice';
import jobHistoryReducer from '../features/job-history/job-history.slice';
import leaveRequestReducer from '../features/leave-request/leave-request.slice';
import payslipReducer from '../features/payslip/payslip.slice';
import holidayReducer from '../features/holiday/holiday.slice';
import resignationRequestReducer from '../features/resignation-request/resignation-request.slice';
import systemSettingReducer from '../features/system-setting/system-setting.slice';
import categoryReducer from '../features/category/category.slice';
import brandReducer from '../features/brand/brand.slice';
import productReducer from '../features/product/product.slice';
import warehouseReducer from '../features/warehouse/warehouse.slice';
import productStockReducer from '../features/product-stock/product-stock.slice';
import productSerialReducer from '../features/product-serial/product-serial.slice';
import supplierReducer from '../features/supplier/supplier.slice';
import importReceiptReducer from '../features/import-receipt/import-receipt.slice';
import customerReducer from '../features/customer/customer.slice';
import orderReducer from '../features/order/order.slice';
import returnRequestReducer from '../features/return-request/return-request.slice';
import warehouseReportReducer from '../features/warehouse-report/warehouse-report.slice';
import hrReportReducer from '../features/hr-report/hr-report.slice';

// Import your reducers here
const rootReducer = combineReducers({
    auth: authReducer,
    role: roleReducer,
    department: departmentReducer,
    position: positionReducer,
    employee: employeeReducer,
    user: userReducer,
    jobHistory: jobHistoryReducer,
    leaveRequest: leaveRequestReducer,
    payslip: payslipReducer,
    holiday: holidayReducer,
    resignationRequest: resignationRequestReducer,
    systemSetting: systemSettingReducer,
    category: categoryReducer,
    brand: brandReducer,
    product: productReducer,
    warehouse: warehouseReducer,
    productStock: productStockReducer,
    productSerial: productSerialReducer,
    supplier: supplierReducer,
    importReceipt: importReceiptReducer,
    customer: customerReducer,
    order: orderReducer,
    returnRequest: returnRequestReducer,
    warehouseReport: warehouseReportReducer,
    hrReport: hrReportReducer,
});

export default rootReducer;