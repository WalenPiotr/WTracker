import * as React from 'react';
import * as ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
// import RectSelect from '@components/RectSelect/RectSelect';
import VideoCut from '@components/VideoCut/VideoCut';

import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
    body {
        background-color: rgba(20,20,20);
    }
`;

ReactDOM.render(
    <div>
        <VideoCut />
        <GlobalStyle />
    </div>,
    document.getElementById('root'),
);
registerServiceWorker();
