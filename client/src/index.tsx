import * as React from 'react';
import * as ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
// import RectSelect from '@components/RectSelect/RectSelect';
import VideoCut from '@components/VideoCut/VideoCut';

import { createGlobalStyle } from 'styled-components';
import RectSelect from '@components/RectSelect/RectSelect';

const GlobalStyle = createGlobalStyle`
    body {
        background-color: rgba(20,20,20);
    }
`;

ReactDOM.render(
    <div>
        <VideoCut />
        <hr />
        <RectSelect />
        <hr />
        <GlobalStyle />
    </div>,
    document.getElementById('root'),
);
registerServiceWorker();
