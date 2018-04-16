import React from 'react';
import { Marker, Polyline, DirectionsRenderer } from 'react-google-maps';
import { getObjectValues } from '../utils'

const Route = ({steps, directions}) =>
<div>
    {steps.map((step, i, steps) => {
        switch (i % 2){
            case 0:
            const { lat, lng, id, name } = step;
            return <Marker
                noRedraw
                key={i}
				position={{lat, lng}}
				label={`${id} - ${name}`}
            />
            case 1:
            let from = steps[i-1];
            const stops = getObjectValues(step.connectedStops);
            from = stops.findIndex(a => a.id === from.id);
            let to = steps[i+1];
            to = stops.findIndex(a => a.id === to.id);
            if (i === 3)  debugger;
            return <Polyline
                key={i}
                options={{
                    geodesic: true,
                    strokeWeight: 5,
                    strokeColor: `hsla(${200}, 35%, 35%, 0.5)`
                }}
                path={stops
                    // .filter((a, i) => i >= _route[1].connectedStops.findIndex(a=>a.id === _route[0].id) &&  i <= _route[1].connectedStops.findIndex(a=>a.id === _route[2].id))
                    .filter((_, i) => i >= from && i <= to)
                    .map(({lat, lng})=> ({lat, lng}))}>
            </Polyline>
            default: return null
        }
    })}
    {
        // directions ? <DirectionsRenderer directions={directions}/> : ''
    }
</div>

export default Route;
