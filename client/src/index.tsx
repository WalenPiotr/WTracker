import * as React from 'react';
import * as ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';

import { createGlobalStyle } from 'styled-components';
import StatusBar from '@components/StatusBar';
// import VideoCut from '@components/VideoCut/VideoCut';
// import RectSelect from '@components/RectSelect/RectSelect';

import { createStore } from 'redux';
import rootReducer from '@reducers/index';
import { Provider } from 'react-redux';

const GlobalStyle = createGlobalStyle`
    body {
        padding: 0;
        margin: 0;
        background-color: rgba(20,20,20);
    }
`;

const store = createStore(rootReducer);

ReactDOM.render(
    <Provider store={store}>
        <div>
            <StatusBar />
            <GlobalStyle />
        </div>
    </Provider>,
    document.getElementById('root'),
);
registerServiceWorker();
