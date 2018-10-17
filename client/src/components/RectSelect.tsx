import * as React from 'react';
import styled from '@styled-components';
import { instanceOf } from 'prop-types';

interface Rectangle {
    min: Point;
    max: Point;
}

interface Point {
    x: number;
    y: number;
}

const canvasSize = {
    x: 800,
    y: 500,
};

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
        current: 'min',
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

            const val = {
                x: Math.round(
                    ((event.clientX - x0) * this.state.size.x) / canvasSize.x,
                ),
                y: Math.round(
                    ((event.clientY - y0) * this.state.size.y) / canvasSize.y,
                ),
            };
            console.log(val);

            this.setState((prevState: RectSelectState) => ({
                ...prevState,
                tracked: {
                    ...prevState.tracked,
                    [this.state.current]: val,
                },
            }));
        }
    };

    btnClick = () => {
        if (this.state.current === 'min') {
            this.setState((prevState: RectSelectState) => ({
                ...prevState,
                current: 'max',
            }));
        } else if (this.state.current === 'max') {
            this.setState((prevState: RectSelectState) => ({
                ...prevState,
                current: 'min',
            }));
        }
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
        console.log(this.state);
        return (
            <div>
                <Canvas
                    size={canvasSize}
                    originalSize={this.state.size}
                    src={this.state.url}
                    onClick={this.handleClick}
                    tracked={this.state.tracked}
                />
                <SControls>
                    <SPointBox>
                        <SButton
                            onClick={this.btnClick}
                            highlight={this.state.current === 'min'}
                        >
                            1st Point
                        </SButton>
                        <label>x = </label>
                        <SInput
                            value={this.state.tracked.min.x}
                            onChange={this.handleChange('min', 'x')}
                        />
                        <label>y = </label>
                        <SInput
                            value={this.state.tracked.min.y}
                            onChange={this.handleChange('min', 'y')}
                        />
                    </SPointBox>
                    <SPointBox>
                        <SButton
                            onClick={this.btnClick}
                            highlight={this.state.current === 'max'}
                        >
                            2nd Point
                        </SButton>
                        <label>x = </label>
                        <SInput
                            value={this.state.tracked.max.x}
                            onChange={this.handleChange('max', 'x')}
                        />
                        <label>y = </label>
                        <SInput
                            value={this.state.tracked.max.y}
                            onChange={this.handleChange('max', 'y')}
                        />
                    </SPointBox>
                </SControls>
            </div>
        );
    }
}

const SPointBox = styled.div`
    margin: 10px;
`;

const SControls = styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
    flex-direction: row;
`;

const SInput = styled.input``;

const SButton = styled.button`
    background-color: ${({ highlight }) =>
        highlight ? 'green' : 'transparent'};
    margin-bottom: 5px;
`;

interface CanvasProps {
    src: string;
    onClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    size: Point;
    originalSize: Point;
    tracked: Rectangle;
}

class Canvas extends React.Component<CanvasProps, any> {
    componentDidMount() {
        this.updateCanvas();
    }
    componentDidUpdate() {
        this.updateCanvas();
    }

    drawRect(ctx: CanvasRenderingContext2D, tracked: Rectangle) {
        const { originalSize, size } = this.props;
        const x = (tracked.min.x / originalSize.x) * size.x;
        const y = (tracked.min.y / originalSize.y) * size.y;
        const w = ((tracked.max.x - tracked.min.x) / originalSize.x) * size.x;
        const h = ((tracked.max.y - tracked.min.y) / originalSize.y) * size.y;

        ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.rect(x, y, w, h);
        ctx.stroke();
    }

    //currently not used
    drawBackground(ctx: CanvasRenderingContext2D, src: string): Promise<void> {
        return new Promise<void>(function(resolve, reject) {
            var background = new Image();
            background.src = src;
            background.onload = function() {
                ctx.drawImage(background, 0, 0);
                resolve();
            };
        });
    }

    clearCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
    }

    async updateCanvas() {
        if (this.refs.canvas instanceof HTMLCanvasElement) {
            const ctx = this.refs.canvas.getContext('2d');
            this.clearCanvas(ctx, this.refs.canvas);
            // await this.drawBackground(ctx, this.props.src);
            this.drawRect(ctx, this.props.tracked);
        }
    }
    render() {
        return (
            <SDiv size={this.props.size}>
                <SCanvas
                    ref="canvas"
                    width={this.props.size.x}
                    height={this.props.size.y}
                    onClick={this.props.onClick}
                />
                <SImg src={this.props.src} size={this.props.size} />
            </SDiv>
        );
    }
}

const SCanvas = styled.canvas`
    position: absolute;
    z-index: 2;
    user-select: none;
`;

interface SImgProps {
    size: Point;
}

const SImg = styled.img`
    width: ${({ size }: SImgProps) => `${size.x}px`};
    height: ${({ size }: SImgProps) => `${size.y}px`};
    position: absolute;
    z-index: 1;
    user-select: none;
`;
const SDiv = styled.div`
    position: relative;
    width: ${({ size }: SImgProps) => `${size.x}px`};
    height: ${({ size }: SImgProps) => `${size.y}px`};
    margin: 10px auto;
    user-select: none;
`;

export default RectSelect;
