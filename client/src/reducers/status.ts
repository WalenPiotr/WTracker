import { AnyAction } from 'redux';

export enum StatusAction {
    CLEAR,
    SET_ERROR,
    SET_INFO,
}

export enum StatusType {
    NONE,
    ERROR,
    INFO,
}

export interface IStatus {
    type: StatusType;
    message: string;
}

const initialState: IStatus = {
    type: StatusType.NONE,
    message: '',
};

export default (state = initialState, action: AnyAction) => {
    switch (action.type) {
        case StatusAction.SET_ERROR:
            return {
                ...state,
                type: StatusType.ERROR,
                message: action.message,
            };
        case StatusAction.SET_INFO:
            return { ...state, type: StatusType.INFO, message: action.message };
        case StatusAction.CLEAR:
            return { ...state, type: StatusType.NONE, message: '' };
        default:
            return state;
    }
};
