import * as React from 'react';
import { Stage, Layer, Rect, Circle } from 'react-konva';
import * as Konva from 'konva';
import { Timestamp } from '@reducers/userInput';

interface TimelineProps {
    start: number;
    end: number;
    count: number;
    setTimestamp: (type: Timestamp, value: number) => void;
}

interface Colors {
    background: string;
    cut: string;
    bar: string;
    anchor: { fill: string; stroke: string };
}

const colors: Colors = {
    background: 'rgb(100, 100, 100)',
    cut: 'rgb(130, 130, 130)',
    bar: 'rgb(200, 0, 0)',
    anchor: {
        fill: 'rgb(200, 200, 200)',
        stroke: 'rgb(150, 150, 150)',
    },
};

interface Dimensions {
    canvas: {
        height: number;
        padding: number;
    };
    timeline: {
        width: number;
        height: number;
        radius: number;
    };
    anchor: {
        radius: number;
        stroke: {
            in: number;
            out: number;
        };
    };
}
const dimensions: Dimensions = {
    canvas: {
        height: 40,
        padding: 20,
    },
    timeline: {
        height: 10,
        width: 1000,
        radius: 5,
    },
    anchor: {
        radius: 8,
        stroke: { in: 4, out: 2 },
    },
};

class Timeline extends React.Component<TimelineProps, any> {
    render() {
        const timelineRect = {
            x: 0,
            y: Math.round(
                (dimensions.canvas.height - dimensions.timeline.height) / 2,
            ),
            width: dimensions.timeline.width,
            height: dimensions.timeline.height,
        };
        return (
            <div>
                <Stage
                    x={dimensions.canvas.padding}
                    width={
                        dimensions.timeline.width +
                        2 * dimensions.canvas.padding
                    }
                    height={dimensions.canvas.height}
                >
                    <Layer>
                        <Rect
                            x={timelineRect.x}
                            y={timelineRect.y}
                            width={timelineRect.width}
                            height={timelineRect.height}
                            fill={colors.background}
                            cornerRadius={dimensions.timeline.radius}
                        />
                    </Layer>
                    <CutLayer {...this.props} />
                </Stage>
            </div>
        );
    }
}

interface CutLayerProps {
    start: number;
    end: number;
    count: number;
    setTimestamp: (type: Timestamp, value: number) => void;
}

interface CutLayerState {
    hovered: {
        anchorStart: boolean;
        anchorEnd: boolean;
    };
}

enum AnchorKind {
    Start = 'anchorStart',
    End = 'anchorEnd',
}

class CutLayer extends React.Component<CutLayerProps, CutLayerState> {
    state: CutLayerState = {
        hovered: {
            anchorStart: false,
            anchorEnd: false,
        },
    };

    dragBoundFunc = (pos: Konva.Vector2d): Konva.Vector2d => ({
        x: pos.x,
        y: dimensions.canvas.height / 2,
    });

    onDragEnd = (type: Timestamp) => (
        evtObj: Konva.KonvaEventObject<DragEvent>,
    ) => {
        const { count } = this.props;
        const scaleX = dimensions.timeline.width / (count - 1);

        const event = evtObj.evt;
        const target = event.target;
        if (target instanceof HTMLCanvasElement) {
            const timestamp = Math.round(evtObj.target.x() / scaleX);
            this.props.setTimestamp(type, timestamp);
        }
    };

    onMouseOver = (anchorKind: AnchorKind) => () => {
        this.setState((prevState: CutLayerState) => ({
            ...prevState,
            hovered: {
                ...prevState.hovered,
                [anchorKind]: true,
            },
        }));
    };

    onMouseOut = (anchorKind: AnchorKind) => () => {
        this.setState((prevState: CutLayerState) => ({
            ...prevState,
            hovered: {
                ...prevState.hovered,
                [anchorKind]: false,
            },
        }));
    };

    render() {
        const { count } = this.props;
        const scaleX = dimensions.timeline.width / (count - 1);

        const rect = {
            x: this.props.start * scaleX,
            y: (dimensions.canvas.height - dimensions.timeline.height) / 2,
            width: (this.props.end - this.props.start) * scaleX,
            height: dimensions.timeline.height,
        };

        const circle1 = {
            x: rect.x,
            y: rect.y + rect.height / 2,
            radius: dimensions.anchor.radius,
        };

        const circle2 = {
            x: rect.x + rect.width,
            y: rect.y + rect.height / 2,
            radius: dimensions.anchor.radius,
        };
        return (
            <Layer>
                <Rect
                    x={rect.x}
                    y={rect.y}
                    width={rect.width}
                    height={rect.height}
                    fill={colors.cut}
                    name={'cut-rect'}
                    draggable={false}
                    cornerRadius={dimensions.timeline.radius}
                />
                <Circle
                    x={circle1.x}
                    y={circle1.y}
                    radius={circle1.radius}
                    fill={colors.anchor.fill}
                    stroke={colors.anchor.stroke}
                    strokeWidth={
                        this.state.hovered[AnchorKind.Start]
                            ? dimensions.anchor.stroke.in
                            : dimensions.anchor.stroke.out
                    }
                    dragBoundFunc={this.dragBoundFunc}
                    onDragEnd={this.onDragEnd(Timestamp.Start)}
                    onMouseOver={this.onMouseOver(AnchorKind.Start)}
                    onMouseOut={this.onMouseOut(AnchorKind.Start)}
                    draggable
                />
                <Circle
                    x={circle2.x}
                    y={circle2.y}
                    radius={circle2.radius}
                    fill={colors.anchor.fill}
                    stroke={colors.anchor.stroke}
                    strokeWidth={
                        this.state.hovered[AnchorKind.End]
                            ? dimensions.anchor.stroke.in
                            : dimensions.anchor.stroke.out
                    }
                    dragBoundFunc={this.dragBoundFunc}
                    onDragEnd={this.onDragEnd(Timestamp.End)}
                    onMouseOver={this.onMouseOver(AnchorKind.End)}
                    onMouseOut={this.onMouseOut(AnchorKind.End)}
                    draggable
                />
            </Layer>
        );
    }
}

export default Timeline;
