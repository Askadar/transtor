import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Provider } from 'mobx-react';
import { Pathing, Main } from './store';

import registerServiceWorker from './registerServiceWorker';

ReactDOM.render
(<Provider Pathing={new Pathing()} Main={new Main()}>
    <App />
</Provider>, document.getElementById('root'));
registerServiceWorker();
