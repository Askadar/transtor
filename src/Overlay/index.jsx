import React from 'react';
import { observer } from 'mobx-react';

import RoutesList from './RoutesList'

import './Overlay.styl'

const Overlay = ({search, handleSearchChanged, children, routes}) =>
<div className="overlay">
    Address <input type="text" value={search} onChange={evt => handleSearchChanged(evt.target.value)}/>
    {routes ? <RoutesList routes={routes}></RoutesList> : null}
    {children}
</div>

export default observer(Overlay);
