import * as React from 'react';

interface VideoCutState {
    images: Map<number, string>;
    frameIndices: number[];
}

const numberOfFrames = 8;

class VideoCut extends React.Component<any, VideoCutState> {
    state = {
        images: new Map<number, string>(),
        frameIndices: [],
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

        const lastFrame = jsonResponse.Meta.Count - 1;
        console.log(lastFrame);
        const frameIndices: number[] = [];
        for (var i = 0; i <= lastFrame; i = i + lastFrame / numberOfFrames) {
            frameIndices.push(Math.floor(i));
        }

        const images: Map<number, string> = new Map<number, string>();

        for (const index of frameIndices) {
            const response = await fetch(
                'http://127.0.0.1:8080/frame/1BeTQwRs6A5fwq1OWfmsMhXR5aV',
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        index,
                    }),
                },
            );
            const blob = await response.blob();
            const urlCreator = window.URL;
            images.set(index, urlCreator.createObjectURL(blob));
        }
        this.setState((prevState: VideoCutState) => ({
            ...prevState,
            images,
            frameIndices,
        }));
    }

    render() {
        const frameComponents = this.state.frameIndices.map((index: number) => (
            <div key={index}>
                <label>{index}</label>
                <div>
                    <img src={this.state.images.get(index)} />
                </div>
            </div>
        ));

        return <div>{frameComponents}</div>;
    }
}

export default VideoCut;
