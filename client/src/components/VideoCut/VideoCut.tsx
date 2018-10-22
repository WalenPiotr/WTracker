import * as React from 'react';
import styled from '@styled-components';

interface VideoCutProps {}

interface VideoCutState {
    indices: {
        current: number;
        start: number;
        end: number;
    };
    count: number;
    images: {
        start: string;
        current: string;
        end: string;
    };
}

enum Timestamp {
    Start = 'start',
    Current = 'current',
    End = 'end',
}

const imgSize = {
    x: 320,
    y: 180,
};
class VideoCut extends React.Component<VideoCutProps, VideoCutState> {
    state = {
        indices: {
            start: 0,
            current: 0,
            end: 1,
        },
        count: 2,
        images: {
            start: '',
            current: '',
            end: '',
        },
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

        const jsonResponse = await metaResponse.json();
        await this.setState(prevState => ({
            ...prevState,
            count: jsonResponse.Meta.Count,
            indices: {
                start: 0,
                current: Math.round((jsonResponse.Meta.Count - 1) / 2),
                end: jsonResponse.Meta.Count - 1,
            },
        }));

        await this.updateFrames(
            Timestamp.Start,
            this.state.indices[Timestamp.Start],
        );
        await this.updateFrames(
            Timestamp.Current,
            this.state.indices[Timestamp.Current],
        );
        await this.updateFrames(
            Timestamp.End,
            this.state.indices[Timestamp.End],
        );
    }

    async updateFrames(type: Timestamp, index: number) {
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
                    size: imgSize,
                    indices: frameIndices,
                }),
            },
        );
        const parsedJSON = await response.json();
        this.setState(prevState => ({
            ...prevState,
            images: {
                ...prevState.images,
                [type]: parsedJSON.IndexToImage[index],
            },
        }));
    }

    setCurrent = async (timestamp: number) => {
        await this.setState(prevState => {
            return {
                ...prevState,
                indices: {
                    ...prevState.indices,
                    current: Math.round(timestamp * (this.state.count - 1)),
                },
            };
        });

        console.log(this.state);

        await this.updateFrames(
            Timestamp.Current,
            this.state.indices[Timestamp.Current],
        );
    };

    setTimestamp = async (type: Timestamp) => {
        if ([Timestamp.Start, Timestamp.End].indexOf(type) > -1) {
            if (
                (type == Timestamp.Start &&
                    this.state.indices.current <=
                        this.state.indices[Timestamp.End]) ||
                (type == Timestamp.End &&
                    this.state.indices.current >=
                        this.state.indices[Timestamp.Start])
            ) {
                await this.setState(prevState => {
                    return {
                        ...prevState,
                        indices: {
                            ...prevState.indices,
                            [type]: prevState.indices.current,
                        },
                    };
                });
                await this.updateFrames(type, this.state.indices[type]);
            }
        }
    };

    handleChange = (type: Timestamp) => async (event: React.ChangeEvent) => {
        event.persist();
        const target = event.target;
        if (target instanceof HTMLInputElement) {
            await this.setState((prevState: VideoCutState) => ({
                ...prevState,
                indices: {
                    ...prevState.indices,
                    [type]: target.value,
                },
            }));

            const v = parseInt(target.value);
            if (!isNaN(v)) {
                await this.updateFrames(type, v);
            }
        }
    };

    render() {
        return (
            <STimelineBox>
                <SViewBox>
                    <SImageBox>
                        <SImg
                            src={`data:image/png;base64,${
                                this.state.images[Timestamp.Start]
                            }`}
                        />
                        <SInput
                            value={this.state.indices.start}
                            onChange={this.handleChange(Timestamp.Start)}
                        />
                    </SImageBox>

                    <SImageBox>
                        <SImg
                            src={`data:image/png;base64,${
                                this.state.images[Timestamp.Current]
                            }`}
                        />
                        <SInput
                            value={this.state.indices.current}
                            onChange={this.handleChange(Timestamp.Current)}
                        />
                    </SImageBox>

                    <SImageBox>
                        <SImg
                            src={`data:image/png;base64,${
                                this.state.images[Timestamp.End]
                            }`}
                        />
                        <SInput
                            value={this.state.indices.end}
                            onChange={this.handleChange(Timestamp.End)}
                        />
                    </SImageBox>
                </SViewBox>

                <TimelineCanvas
                    start={this.state.indices.start / (this.state.count - 1)}
                    end={this.state.indices.end / (this.state.count - 1)}
                    current={
                        this.state.indices.current / (this.state.count - 1)
                    }
                    setCurrent={this.setCurrent}
                    setTimestamp={this.setTimestamp}
                />
            </STimelineBox>
        );
    }
}

const SInput = styled.input`
    height: 40px;
    font-size: 16px;
    width: 100%;
    padding-left: 10px;
    border: 1px solid grey;
    background-color: transparent;
    color: white;
    box-sizing: border-box;
`;

const SViewBox = styled.div`
    display: flex;
`;

const SImageBox = styled.div`
    display: flex;
    flex-direction: column;
    padding: 10px;
`;

const STimelineBox = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`;

const SImg = styled.img`
    width: ${imgSize.x}px;
    height: ${imgSize.y}px;
    margin-bottom: 10px;
`;

export default VideoCut;

interface TimelineCanvasProps {
    start: number;
    end: number;
    current: number;
    setCurrent: (timestamp: number) => void;
    setTimestamp: (type: Timestamp) => void;
}

class TimelineCanvas extends React.Component<TimelineCanvasProps, any> {
    componentDidMount() {
        this.updateCanvas();
    }
    componentDidUpdate() {
        this.updateCanvas();
    }

    handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        event.persist();
        const target = event.target;
        if (target instanceof HTMLCanvasElement) {
            const rect = target.getBoundingClientRect();
            const timestamp = (event.pageX - rect.left) / rect.width;
            this.props.setCurrent(timestamp);
        }
    };

    drawBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        ctx.beginPath();
        ctx.fillStyle = 'rgb(100, 100, 100)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.stroke();
        ctx.closePath();
    }

    drawSegment(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        const x = Math.round(canvas.width * this.props.start);
        const w = Math.round(
            canvas.width * (this.props.end - this.props.start),
        );

        ctx.beginPath();
        ctx.fillStyle = 'rgb(150, 150, 150)';
        ctx.fillRect(x, 8, w, canvas.height);
        ctx.stroke();
        ctx.closePath();
    }

    drawTimestamp(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        const w = 2;
        const x = Math.round(canvas.width * this.props.current) - w / 2;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(100, 0, 0, 1.0)';
        ctx.fillRect(x, 0, w, canvas.height);
        ctx.stroke();
        ctx.closePath();
    }

    clearCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        ctx.beginPath();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.closePath();
    }

    async updateCanvas() {
        if (this.refs.canvas instanceof HTMLCanvasElement) {
            const ctx = this.refs.canvas.getContext('2d');
            if (ctx !== null) {
                this.clearCanvas(ctx, this.refs.canvas);
                this.drawBackground(ctx, this.refs.canvas);
                this.drawSegment(ctx, this.refs.canvas);
                this.drawTimestamp(ctx, this.refs.canvas);
            }
        }
    }

    render() {
        return (
            <div>
                <canvas
                    ref="canvas"
                    width={1000}
                    height={40}
                    onClick={this.handleClick}
                />
                <SControlsBox>
                    <SButton
                        onClick={() => this.props.setTimestamp(Timestamp.Start)}
                    >
                        Set Start
                    </SButton>

                    <SButton
                        onClick={() => this.props.setTimestamp(Timestamp.End)}
                    >
                        Set End
                    </SButton>
                </SControlsBox>
            </div>
        );
    }
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
