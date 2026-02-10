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

// Import your reducers here
// import userReducer from './userReducer';
// import productReducer from './productReducer';

const rootReducer = combineReducers({
    // user: userReducer,
    // product: productReducer,
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
});

export default rootReducer;