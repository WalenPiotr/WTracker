import * as React from 'react';
import * as ReactKonva from 'react-konva';
import * as Konva from 'konva';

import styled from 'styled-components';

import { CornerKind } from './RectSelect';
import Point from '@interfaces/Point';

const canvas = {
    width: 1280,
    height: 720,
};

interface CanvasDimensions {
    corner: {
        strokeWidth: {
            standard: number;
            hovered: number;
        };
        radius: number;
    };
    margin: number;
}

const canvasDimensions: CanvasDimensions = {
    corner: {
        strokeWidth: {
            standard: 2,
            hovered: 4,
        },
        radius: 8,
    },
    margin: 20,
};
interface CanvasColors {
    shadowRect: string;
    rect: string;
    anchor: {
        fill: string;
        stroke: string;
    };
}

const colors: CanvasColors = {
    shadowRect: 'rgb(150, 150, 150)',
    rect: 'rgb(200, 200, 200)',
    anchor: {
        fill: 'rgb(200, 200, 200)',
        stroke: 'rgb(150, 150, 150)',
    },
};

interface CanvasProps {
    src: string;
    rect: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    setCorner: (kind: CornerKind, point: Point) => void;
}

interface CanvasState {
    loaded: boolean;
    image: HTMLImageElement;
    hovered: {
        [CornerKind.TopLeft]: boolean;
        [CornerKind.BottomRight]: boolean;
    };
}

class Canvas extends React.Component<CanvasProps, CanvasState> {
    state: CanvasState = {
        loaded: false,
        image: new Image(),
        hovered: {
            [CornerKind.TopLeft]: false,
            [CornerKind.BottomRight]: false,
        },
    };

    loadImage = (): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const image: HTMLImageElement = new Image();
            image.onload = () => {
                resolve(image);
            };
            image.onerror = () => {
                reject(new Error());
            };
            image.src = this.props.src;
        });
    };

    componentDidUpdate = async (prevProps: CanvasProps) => {
        if (prevProps.src !== this.props.src) {
            const image = await this.loadImage();
            this.setState((prevState: CanvasState) => ({
                ...prevState,
                image: image,
                loaded: true,
            }));
        }
    };

    onDragEnd = (kind: CornerKind) => (
        evtObj: Konva.KonvaEventObject<DragEvent>,
    ) => {
        const event = evtObj.evt;
        const target = event.target;
        if (target instanceof HTMLCanvasElement) {
            const point: Point = {
                x: evtObj.target.x() / canvas.width,
                y: evtObj.target.y() / canvas.height,
            };
            if (point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1) {
                this.props.setCorner(kind, point);
            }
        }
    };

    onDragMove = (kind: CornerKind) => (
        evtObj: Konva.KonvaEventObject<DragEvent>,
    ) => {
        const event = evtObj.evt;
        const target = event.target;
        if (target instanceof HTMLCanvasElement) {
            const point: Point = {
                x: evtObj.target.x() / canvas.width,
                y: evtObj.target.y() / canvas.height,
            };
            if (point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1) {
                this.props.setCorner(kind, point);
            }
        }
    };

    onMouseOver = (cornerKind: CornerKind) => () => {
        console.log('aaa');
        this.setState((prevState: CanvasState) => ({
            ...prevState,
            hovered: {
                ...prevState.hovered,
                [cornerKind]: true,
            },
        }));
    };

    onMouseOut = (cornerKind: CornerKind) => () => {
        this.setState((prevState: CanvasState) => ({
            ...prevState,
            hovered: {
                ...prevState.hovered,
                [cornerKind]: false,
            },
        }));
    };

    render() {
        const backgroundRect = this.state.loaded ? (
            <ReactKonva.Image
                height={canvas.height}
                width={canvas.width}
                image={this.state.image}
                fillEnabled={true}
            />
        ) : (
            <ReactKonva.Rect
                height={canvas.height}
                width={canvas.width}
                fill={'black'}
            />
        );

        return (
            <SDiv>
                <ReactKonva.Stage
                    x={canvasDimensions.margin}
                    y={canvasDimensions.margin}
                    height={canvas.height + 2 * canvasDimensions.margin}
                    width={canvas.width + 2 * canvasDimensions.margin}
                >
                    <ReactKonva.Layer>{backgroundRect}</ReactKonva.Layer>
                    <ReactKonva.Layer>
                        <ReactKonva.Rect
                            x={this.props.rect.x * canvas.width}
                            y={this.props.rect.y * canvas.height}
                            width={this.props.rect.width * canvas.width}
                            height={this.props.rect.height * canvas.height}
                            stroke={colors.rect}
                        />
                        <ReactKonva.Circle
                            x={this.props.rect.x * canvas.width}
                            y={this.props.rect.y * canvas.height}
                            radius={canvasDimensions.corner.radius}
                            fill={colors.anchor.fill}
                            stroke={colors.anchor.stroke}
                            strokeWidth={
                                this.state.hovered[CornerKind.TopLeft]
                                    ? canvasDimensions.corner.strokeWidth
                                          .hovered
                                    : canvasDimensions.corner.strokeWidth
                                          .standard
                            }
                            onDragEnd={this.onDragEnd(CornerKind.TopLeft)}
                            onDragMove={this.onDragMove(CornerKind.TopLeft)}
                            draggable
                            onMouseOver={this.onMouseOver(CornerKind.TopLeft)}
                            onMouseOut={this.onMouseOut(CornerKind.TopLeft)}
                        />
                        <ReactKonva.Circle
                            x={
                                (this.props.rect.x + this.props.rect.width) *
                                canvas.width
                            }
                            y={
                                (this.props.rect.y + this.props.rect.height) *
                                canvas.height
                            }
                            radius={canvasDimensions.corner.radius}
                            strokeWidth={
                                this.state.hovered[CornerKind.BottomRight]
                                    ? canvasDimensions.corner.strokeWidth
                                          .hovered
                                    : canvasDimensions.corner.strokeWidth
                                          .standard
                            }
                            fill={colors.anchor.fill}
                            stroke={colors.anchor.stroke}
                            onDragEnd={this.onDragEnd(CornerKind.BottomRight)}
                            onDragMove={this.onDragMove(CornerKind.BottomRight)}
                            draggable
                            onMouseOver={this.onMouseOver(
                                CornerKind.BottomRight,
                            )}
                            onMouseOut={this.onMouseOut(CornerKind.BottomRight)}
                        />
                    </ReactKonva.Layer>
                </ReactKonva.Stage>
            </SDiv>
        );
    }
}

export default Canvas;

const SDiv = styled.div`
    display: flex;
    justify-content: center;
`;
