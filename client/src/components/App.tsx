// import * as Raven from 'raven-js';
import * as React from 'react';
import { injectGlobal } from '@styled-components';

injectGlobal`
    body, table, a, button, input  {
        font-family: 'Gill Sans', 'Gill Sans MT', 'Calibri', 'Trebuchet MS', sans-serif
    }
`;

class App extends React.Component<any, any> {
    render() {
        return <div />;
    }
}

export default App;
