import React from 'react';
import { observer } from 'mobx-react';

import './Overlay.styl'

const Overlay = ({search, handleSearchChanged, children}) =>
<div className="overlay">
    Address <input type="text" value={search} onChange={evt => handleSearchChanged(evt.target.value)}/>
    {children}
</div>

export default observer(Overlay);
