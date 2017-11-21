import React from 'react';
import { observer } from 'mobx-react';

const Overlay = ({search, handleSearchChanged}) =>
<div>
    Address <input type="text" value={search} onChange={evt => handleSearchChanged(evt.target.value)}/>
</div>

export default observer(Overlay);
