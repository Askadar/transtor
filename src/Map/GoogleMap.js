import React from 'react';
import {  withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';

const Map = withScriptjs(withGoogleMap(({stops, routes, updateSelectFromMarker, ...rest}) =>
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
        {routes && routes.from && <Marker key="A" position={routes.from} label="A"/>}
        {routes && routes.to && <Marker key="B" position={routes.to} label="B"/>}
</GoogleMap>))

export default Map;
