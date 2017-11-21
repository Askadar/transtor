import React from 'react';
import {  withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';

const Map = withScriptjs(withGoogleMap(({stops, updateSelectFromMarker}) =>
<GoogleMap
    defaultZoom={12}
    defaultCenter={{ lat: 53.9006102, lng: 27.5623241 }}
	>
        <div>
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
        </div>
</GoogleMap>))

export default Map;
