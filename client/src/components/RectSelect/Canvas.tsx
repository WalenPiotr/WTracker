import * as React from 'react';
import styled from '@styled-components';
import Point from '@interfaces/Point';
import Rectangle from '@interfaces/Rectangle';

interface CanvasProps {
    src: string;
    onClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    originalSize: Point;
    tracked: Rectangle;
    current: string;
}

interface CanvasState {
    currentPos: Point;
    mouseEntered: boolean;
}

class Canvas extends React.Component<CanvasProps, CanvasState> {
    state = {
        currentPos: {
            x: 0,
            y: 0,
        },
        mouseEntered: false,
    };
    componentDidMount() {
        this.updateCanvas();
    }
    componentDidUpdate() {
        this.updateCanvas();
    }

    drawRect(
        ctx: CanvasRenderingContext2D,
        tracked: Rectangle,
        originalSize: Point,
    ) {
        const x = Math.round((tracked.min.x * canvasSize.x) / originalSize.x);
        const y = Math.round((tracked.min.y * canvasSize.y) / originalSize.y);
        const w = Math.round(
            ((tracked.max.x - tracked.min.x) * canvasSize.x) / originalSize.x,
        );
        const h = Math.round(
            ((tracked.max.y - tracked.min.y) * canvasSize.y) / originalSize.y,
        );

        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.rect(x, y, w, h);
        ctx.stroke();
        ctx.closePath();
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

    drawShadowRect = (
        ctx: CanvasRenderingContext2D,
        tracked: Rectangle,
        originalSize: Point,
        current: string,
    ) => {
        if (current !== '' && this.state.mouseEntered) {
            const shadow = Object.assign({}, tracked);
            shadow[current] = this.state.currentPos;
            const x = Math.round(
                (shadow.min.x * canvasSize.x) / originalSize.x,
            );
            const y = Math.round(
                (shadow.min.y * canvasSize.y) / originalSize.y,
            );
            const w = Math.round(
                ((shadow.max.x - shadow.min.x) * canvasSize.x) / originalSize.x,
            );
            const h = Math.round(
                ((shadow.max.y - shadow.min.y) * canvasSize.y) / originalSize.y,
            );

            ctx.beginPath();
            ctx.fillStyle = 'rgba(100, 100, 100, 0.1)';
            ctx.fillRect(x, y, w, h);

            ctx.strokeStyle = 'rgba(100, 100, 100, 0.7)';
            ctx.lineWidth = 2;
            ctx.rect(x, y, w, h);
            ctx.stroke();

            ctx.closePath();
        }
    };

    handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const target = event.target;
        event.persist();
        if (target instanceof HTMLCanvasElement) {
            const bRect = target.getBoundingClientRect();
            this.setState((prevState: CanvasState) => {
                return {
                    ...prevState,
                    currentPos: {
                        x: event.clientX - bRect.left,
                        y: event.clientY - bRect.top,
                    },
                };
            });
        }
    };

    async updateCanvas() {
        if (this.refs.canvas instanceof HTMLCanvasElement) {
            const ctx = this.refs.canvas.getContext('2d');
            if (ctx !== null) {
                this.clearCanvas(ctx, this.refs.canvas);
                // await this.drawBackground(ctx, this.props.src);
                this.drawRect(ctx, this.props.tracked, this.props.originalSize);
                this.drawShadowRect(
                    ctx,
                    this.props.tracked,
                    this.props.originalSize,
                    this.props.current,
                );
            }
        }
    }

    handleMouseEnter = () => {
        this.setState((prevState: CanvasState) => ({
            ...prevState,
            mouseEntered: true,
        }));
    };

    handleMouseLeave = () => {
        this.setState((prevState: CanvasState) => ({
            ...prevState,
            mouseEntered: false,
        }));
    };

    render() {
        return (
            <SDiv size={canvasSize}>
                <SCanvas
                    ref="canvas"
                    onClick={this.props.onClick}
                    width={canvasSize.x}
                    height={canvasSize.y}
                    size={canvasSize}
                    onMouseMove={this.handleMouseMove}
                    onMouseEnter={this.handleMouseEnter}
                    onMouseLeave={this.handleMouseLeave}
                />
                <SImg src={this.props.src} size={canvasSize} />
            </SDiv>
        );
    }
}

const canvasSize = {
    x: 1280,
    y: 720,
};

const SCanvas = styled.canvas`
    position: absolute;
    z-index: 2;
    user-select: none;
    width: ${({ size }: SImgProps) => `${size.x}px`};
    height: ${({ size }: SImgProps) => `${size.y}px`};
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
    width: ${({ size }: SImgProps) => `${size.x}px`};
    height: ${({ size }: SImgProps) => `${size.y}px`};

    position: relative;
    margin: 10px auto;
    user-select: none;
`;

export default Canvas;
