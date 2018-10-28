import status, { IStatus } from '@reducers/status';
import { combineReducers } from 'redux';

export interface IState {
    status: IStatus;
}

const rootReducer = combineReducers({
    status,
});

export default rootReducer;
