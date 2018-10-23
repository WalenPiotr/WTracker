import * as React from 'react';
import styled from '@styled-components';
import { Timestamp } from '../VideoCut';

interface TimelineControlsProps {
    setTimestamp: (type: Timestamp) => void;
}

const SControlsBox = styled.div`
    display: flex;
`;

const SButton = styled.button`
    flex-grow: 1;
    font-size: 16px;
    margin-top: 10px;
    height: 40px;
    background-color: transparent;
    border: 1px solid grey;
    color: white;
`;

const TimelineControls = ({ setTimestamp }: TimelineControlsProps) => (
    <SControlsBox>
        <SButton onClick={() => setTimestamp(Timestamp.Start)}>
            Set Start
        </SButton>
        <SButton onClick={() => setTimestamp(Timestamp.End)}>Set End</SButton>
    </SControlsBox>
);

export default TimelineControls;
