import * as React from 'react';
import * as ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
// import RectSelect from '@components/RectSelect/RectSelect';
import Timeline from '@components/VideoCut/VideoCut';

ReactDOM.render(<Timeline />, document.getElementById('root'));
registerServiceWorker();
