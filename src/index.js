import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Provider } from 'react-mobx';
import * as stores from './store';

import registerServiceWorker from './registerServiceWorker';

ReactDOM.render
(<Provider {...stores}>
    <App />
</Provider>, document.getElementById('root'));
registerServiceWorker();
