import React from 'react';
import {  withScriptjs, withGoogleMap, GoogleMap, Marker, Polyline } from 'react-google-maps';

import { getObjectValues } from '../utils';

const Map = withScriptjs(withGoogleMap(({stops, route, updateSelectFromMarker, ...rest}) =>
<GoogleMap
    defaultZoom={12}
    defaultCenter={{ lat: 53.9006102, lng: 27.5623241 }}
    {...rest}
	>
		{stops
			.map(({id, lat, lng, name}, index) =>
			<Marker
                noRedraw
                key={index}
                onClick={() => updateSelectFromMarker(id)}
				position={{lat, lng}}
				label={`${id} - ${name}`}
			/>
		)}
        {route && route.routes && route.routes
            .sort((a,b) => a.length - b.length)
            .filter((a,b) => a.length === 3 && b < 2)
            .map((_route, i) => {

                return (<div key={i}>
            <Polyline
                options={{
                    geodesic: true,
                    strokeOpacity: 0.3,
                    strokeColor: `rgb(${Math.round(Math.random()*255)},${Math.round(Math.random()*255)},${Math.round(Math.random()*255)})`
                }}
                path={getObjectValues(_route[1].connectedStops).map(({lat, lng})=> ({lat, lng}))}>
            </Polyline>
            {_route[3] && <Polyline
                options={{
                    strokeColor: `rgb(${Math.round(Math.random()*255)},${Math.round(Math.random()*255)},${Math.round(Math.random()*255)})`
                }}
                path={getObjectValues(_route[3].connectedStops).map(({lat, lng})=> ({lat, lng}))}>
            </Polyline>}
            <Marker
                position={{lat: _route[0].lat, lng: _route[0].lng}}
                opacity={0.5}
                label={_route[0].id}
            />
            <Marker position={{lat: _route[2].lat, lng: _route[2].lng}}
                label={_route[2].id}
            />
            {_route[4] && <Marker opacity={0.5} position={{lat: _route[4].lat, lng: _route[4].lng}}
                label={_route[4].id}
            />}
        </div>)})
        }
        {route && route.from && <Marker key="A" position={route.from} label="A"/>}
        {route && route.to && <Marker key="B" position={route.to} label="B"/>}
</GoogleMap>))

export default Map;
