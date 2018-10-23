import * as React from 'react';
import styled from '@styled-components';
import Rectangle from '@interfaces/Rectangle';
import Canvas from './Canvas';
import Point from '@interfaces/Point';
interface RectSelectState {
    image: string;
    tracked: Rectangle;
    size: Point;
}

export enum CornerKind {
    TopLeft = 'min',
    BottomRight = 'max',
}

class RectSelect extends React.Component<any, RectSelectState> {
    state = {
        image: '',
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
    };

    componentDidMount = async () => {
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
                        x: 0.1 * size.x,
                        y: 0.1 * size.y,
                    },
                    max: {
                        x: 0.9 * size.x,
                        y: 0.9 * size.y,
                    },
                },
            }));

            const index = 0;
            const frameIndices: number[] = [index];
            const response = await fetch(
                'http://127.0.0.1:8080/frame/1BeTQwRs6A5fwq1OWfmsMhXR5aV',
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        size: size,
                        indices: frameIndices,
                    }),
                },
            );
            if (response.ok) {
                const parsedJSON = await response.json();
                this.setState(prevState => ({
                    ...prevState,
                    image: parsedJSON.IndexToImage[index],
                }));
            }
        }
    };

    setCorner = (kind: CornerKind, point: Point) => {
        this.setState((prevState: RectSelectState) => ({
            ...prevState,
            tracked: {
                ...prevState.tracked,
                [kind]: {
                    x: Math.round(point.x * prevState.size.x),
                    y: Math.round(point.y * prevState.size.y),
                },
            },
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

    render = () => {
        const rect = {
            x: this.state.tracked.min.x / this.state.size.x,
            y: this.state.tracked.min.y / this.state.size.y,
            width:
                (this.state.tracked.max.x - this.state.tracked.min.x) /
                this.state.size.x,
            height:
                (this.state.tracked.max.y - this.state.tracked.min.y) /
                this.state.size.y,
        };
        return (
            <div>
                <Canvas
                    src={`data:image/png;base64,${this.state.image}`}
                    rect={rect}
                    setCorner={this.setCorner}
                />
                <SControls>
                    <SPointBox>
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
    };
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

export default RectSelect;
