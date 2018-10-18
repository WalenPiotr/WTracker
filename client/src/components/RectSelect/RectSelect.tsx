import * as React from 'react';
import styled from '@styled-components';
import Rectangle from '@interfaces/Rectangle';
import Canvas from './Canvas';

interface RectSelectState {
    url: string;
    tracked: Rectangle;
}

class RectSelect extends React.Component<any, RectSelectState> {
    state = {
        url: '',
        size: {
            x: 1280,
            y: 720,
        },
        tracked: {
            min: {
                x: 0,
                y: 0,
            },
            max: {
                x: 1280,
                y: 720,
            },
        },
        current: '',
    };

    async componentDidMount() {
        const metaResponse = await fetch(
            'http://127.0.0.1:8080/meta/1BeTQwRs6A5fwq1OWfmsMhXR5aV',
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            },
        );

        if (metaResponse.ok) {
            const data = await metaResponse.json();
            const size = {
                x: data.Meta.Size.X,
                y: data.Meta.Size.Y,
            };

            this.setState(prevState => ({
                ...prevState,
                size: size,
                tracked: {
                    min: {
                        x: 0,
                        y: 0,
                    },
                    max: size,
                },
            }));
        }

        const response = await fetch(
            'http://127.0.0.1:8080/frame/1BeTQwRs6A5fwq1OWfmsMhXR5aV',
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    index: 0,
                }),
            },
        );

        if (response.ok) {
            const blob = await response.blob();
            const urlCreator = window.URL;
            this.setState({ url: urlCreator.createObjectURL(blob) });
        }
    }

    handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (event.target instanceof HTMLCanvasElement) {
            const x0 = event.target.getBoundingClientRect().left;
            const y0 = event.target.getBoundingClientRect().top;
            const x1 = event.target.getBoundingClientRect().right;
            const y1 = event.target.getBoundingClientRect().bottom;

            const val = {
                x: Math.round(
                    ((event.clientX - x0) * this.state.size.x) / (x1 - x0),
                ),
                y: Math.round(
                    ((event.clientY - y0) * this.state.size.y) / (y1 - y0),
                ),
            };

            this.setState((prevState: RectSelectState) => ({
                ...prevState,
                tracked: {
                    ...prevState.tracked,
                    [this.state.current]: val,
                },
                current: '',
            }));
        }
    };

    btnClick = (field: string) => () => {
        if (this.state.current === field) {
            field = '';
        }

        this.setState((prevState: RectSelectState) => ({
            ...prevState,
            current: field,
        }));
    };

    handleChange = (point: string, coordinate: string) => (
        event: React.SyntheticEvent<HTMLInputElement>,
    ) => {
        const target = event.target;
        if (target instanceof HTMLInputElement) {
            this.setState((prevState: RectSelectState) => ({
                ...prevState,
                tracked: {
                    ...prevState.tracked,
                    [point]: {
                        ...prevState.tracked[point],
                        [coordinate]: target.value,
                    },
                },
            }));
        }
    };

    render() {
        return (
            <div>
                <Canvas
                    originalSize={this.state.size}
                    src={this.state.url}
                    onClick={this.handleClick}
                    tracked={this.state.tracked}
                    current={this.state.current}
                />
                <SControls>
                    <SPointBox>
                        <SButton
                            onClick={this.btnClick('min')}
                            highlight={this.state.current === 'min'}
                        >
                            1st Point
                        </SButton>
                        <div>
                            <SLabel>x = </SLabel>
                            <SInput
                                value={this.state.tracked.min.x}
                                onChange={this.handleChange('min', 'x')}
                            />
                        </div>
                        <div>
                            <SLabel>y = </SLabel>
                            <SInput
                                value={this.state.tracked.min.y}
                                onChange={this.handleChange('min', 'y')}
                            />
                        </div>
                    </SPointBox>
                    <SPointBox>
                        <SButton
                            onClick={this.btnClick('max')}
                            highlight={this.state.current === 'max'}
                        >
                            2nd Point
                        </SButton>
                        <div>
                            <SLabel>x = </SLabel>
                            <SInput
                                value={this.state.tracked.max.x}
                                onChange={this.handleChange('max', 'x')}
                            />
                        </div>
                        <div>
                            <SLabel>y = </SLabel>
                            <SInput
                                value={this.state.tracked.max.y}
                                onChange={this.handleChange('max', 'y')}
                            />
                        </div>
                    </SPointBox>
                </SControls>
            </div>
        );
    }
}

const SPointBox = styled.div`
    margin: 10px;
    display: flex;
    flex-direction: column;
`;

const SControls = styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
    flex-direction: row;
`;

const SInput = styled.input``;

const SLabel = styled.label`
    margin: 10px;
`;

const SButton = styled.button`
    background-color: ${({ highlight }: { highlight: boolean }) =>
        highlight ? 'green' : 'transparent'};
    margin-bottom: 5px;
`;

export default RectSelect;
