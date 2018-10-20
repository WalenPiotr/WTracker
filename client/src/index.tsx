import * as React from 'react';
import * as ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
// import RectSelect from '@components/RectSelect/RectSelect';
import VideoCut from '@components/VideoCut/VideoCut';

ReactDOM.render(<VideoCut />, document.getElementById('root'));
registerServiceWorker();
