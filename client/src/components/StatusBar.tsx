import * as React from 'react';
import { connect } from 'react-redux';
import { IState } from '@reducers/index';
import { IStatus, StatusType } from '@reducers/status';
import styled from '@styled-components';

interface StatusBarProps {
    status: IStatus;
}

const StatusBar = ({ status }: StatusBarProps) => {
    return <SBar statusType={status.type} />;
};

const barColors = {
    [StatusType.ERROR]: 'red',
    [StatusType.INFO]: 'green',
    [StatusType.NONE]: 'transparent',
};

interface SBarProps {
    statusType: StatusType;
}

const SBar = styled.div`
    visibility: ${({ statusType }: SBarProps) =>
        statusType == StatusType.NONE ? 'hidden' : 'display'};
    position: static;
    width: 100%;
    height: 30px;
    background-color: ${({ statusType }: SBarProps) => barColors[statusType]};
`;

const mapStateToProps = (state: IState) => ({
    status: state.status,
});

export default connect(mapStateToProps)((props: StatusBarProps) => (
    <StatusBar {...props} />
));
