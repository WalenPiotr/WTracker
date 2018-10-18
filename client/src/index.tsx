import * as React from 'react';
import * as ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import RectSelect from '@components/RectSelect/RectSelect';

ReactDOM.render(<RectSelect />, document.getElementById('root'));
registerServiceWorker();
