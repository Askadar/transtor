import React from 'react';
import {inject, observer} from 'mobx-react';

import './RoutesList.styl'

const changeSelectedRoute = (Pathing, direction) => {
    // console.log(this, Pathing, direction);
    let c = Pathing.selectedRoute;
    let l = Pathing.availableRoutes.routes.length;
    if (c + direction < 0)
        return console.log('First');
    if (c + direction >= l)
        return console.log('Last');
    return Pathing.selectedRoute = Pathing.selectedRoute + direction;
}

const RoutesList = ({ Pathing, routes }) =>
<div className="box bottom wide routes-list">
    <span className={`button pagination ion-chevron-left ${Pathing.selectedRoute === 0 ? 'disabled' : ''}`} onClick={changeSelectedRoute.bind(this, Pathing, -1)}/>
    <div className="box">
        {Pathing.availableRoutes.routes[Pathing.selectedRoute].map((a,i ) =>{
                switch(i%2){
                    case 0:
                    return `${i < 1 ? 'От' : 'До'} ${a.name}`
                    case 1:
                    return `Через: ${a.rn} - ${a.routeName}`
                    default: return a.id;

                }
            }).map((content, i) => <div key={i}>{content}</div>)
        }
    </div>
    <span className={
        `button pagination ion-chevron-right ${Pathing.selectedRoute === Pathing.availableRoutes.routes.length - 1 ? 'disabled' : ''}`
    } onClick={changeSelectedRoute.bind(this, Pathing, 1)}/>
</div>

export default inject('Pathing')(observer(RoutesList));
