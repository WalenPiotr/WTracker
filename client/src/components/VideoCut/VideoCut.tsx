import * as React from 'react';
import styled from '@styled-components';
import Timeline from './Timeline/Timeline';

export enum Timestamp {
    Start = 'start',
    End = 'end',
}
interface VideoCutProps {}
interface VideoCutState {
    indices: {
        start: number;
        end: number;
    };
    count: number;
    images: {
        start: string;
        end: string;
    };
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

    setTimestamp = async (type: Timestamp, timestamp: number) => {
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
                            [type]: Math.round(
                                timestamp * (this.state.count - 1),
                            ),
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
                                this.state.images[Timestamp.End]
                            }`}
                        />
                        <SInput
                            value={this.state.indices.end}
                            onChange={this.handleChange(Timestamp.End)}
                        />
                    </SImageBox>
                </SViewBox>

                <Timeline
                    start={this.state.indices.start / (this.state.count - 1)}
                    end={this.state.indices.end / (this.state.count - 1)}
                    current={
                        this.state.indices.current / (this.state.count - 1)
                    }
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
