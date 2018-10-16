// import * as Raven from 'raven-js';
import * as React from 'react';
import styled from '@styled-components';

interface Rectangle {
    min: Point;
    max: Point;
}

interface Point {
    x: number;
    y: number;
}

const size = {
    x: 1200,
    y: 675,
};
const margin = 10;

interface AppState {
    url: string;
    rectangle: Rectangle;
}
class App extends React.Component<any, any> {
    state = {
        url: '',
        rectangle: {
            min: {
                x: margin,
                y: margin,
            },
            max: {
                x: size.x - margin,
                y: size.y - margin,
            },
        },

        current: 'min',
    };

    async componentDidMount() {
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
                    size: {
                        x: size.x,
                        y: size.y,
                    },
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
                x: event.clientX - x0,
                y: event.clientY - y0,
            };

            console.log();

            this.setState((prevState: AppState) => ({
                ...prevState,
                rectangle: {
                    ...prevState.rectangle,
                    [this.state.current]: val,
                },
            }));
        }
    };

    btnClick = () => {
        if (this.state.current === 'min') {
            this.setState((prevState: AppState) => ({
                ...prevState,
                current: 'max',
            }));
        } else if (this.state.current === 'max') {
            this.setState((prevState: AppState) => ({
                ...prevState,
                current: 'min',
            }));
        }
    };
    render() {
        return (
            <div>
                <Canvas
                    src={this.state.url}
                    onClick={this.handleClick}
                    rectangle={this.state.rectangle}
                />
                <div>
                    <button onClick={this.btnClick}>Click</button>
                    <div>
                        <SButton
                            onClick={this.btnClick}
                            highlight={this.state.current === 'min'}
                        >
                            Select First Point
                        </SButton>
                        <div>x = {this.state.rectangle.min.x}</div>
                        <div>y = {this.state.rectangle.min.y}</div>
                    </div>
                    <div>
                        <SButton
                            onClick={this.btnClick}
                            highlight={this.state.current === 'max'}
                        >
                            Select Second Point
                        </SButton>
                        <div>x = {this.state.rectangle.max.x}</div>
                        <div>y = {this.state.rectangle.max.y}</div>
                    </div>
                </div>
            </div>
        );
    }
}

interface CanvasProps {
    src: string;
    onClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    rectangle: Rectangle;
}

class Canvas extends React.Component<CanvasProps, any> {
    componentDidMount() {
        this.updateCanvas();
    }
    componentDidUpdate() {
        this.updateCanvas();
    }

    drawRect(ctx: CanvasRenderingContext2D, rectangle: Rectangle) {
        const { x, y } = rectangle.min;
        const w = rectangle.max.x - x;
        const h = rectangle.max.y - y;

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
            this.drawRect(ctx, this.props.rectangle);
        }
    }
    render() {
        return (
            <SDiv size={size}>
                <SCanvas
                    ref="canvas"
                    width={size.x}
                    height={size.y}
                    onClick={this.props.onClick}
                />
                <SImg src={this.props.src} size={size} />
            </SDiv>
        );
    }
}

const SButton = styled.button`
    background-color: ${({ highlight }) =>
        highlight ? 'green' : 'transparent'};
`;

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
    zindex: 1;
    user-select: none;
`;
const SDiv = styled.div`
    position: relative;
    width: ${({ size }: SImgProps) => `${size.x}px`};
    height: ${({ size }: SImgProps) => `${size.y}px`};
    margin: 10px auto;
    user-select: none;
`;

export default App;
