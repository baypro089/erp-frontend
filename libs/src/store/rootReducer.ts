import { combineReducers } from 'redux';
import authReducer from '../features/auth/auth.slice';

// Import your reducers here
// import userReducer from './userReducer';
// import productReducer from './productReducer';

const rootReducer = combineReducers({
    // user: userReducer,
    // product: productReducer,
    auth: authReducer,
});

export default rootReducer;