import React from 'react';
import ReactMapboxGl, { Marker as GMarker, Layer, Feature } from "react-mapbox-gl";

import './MapBox.styl';

const GMap = ReactMapboxGl({
  accessToken: "pk.eyJ1IjoiZ3JpZGZlbiIsImEiOiJjaXl2aHNkY3YwMDZkMnFwYTViZTRvdHZtIn0.1M9sk_Q05J1Tmen6QnQ2qQ",
  injectCss: true,
  hash: true,
  // scrollZoom: false,
});
const Map = ({ mapboxCenter, selectedStop, handleSelectedMarker}) =>
<GMap
    style="mapbox://styles/mapbox/streets-v8"
    center={mapboxCenter}
    containerStyle={{
        height: "calc(100vh - 200px)",
        width: "100vw"
      }}
      >
          <Layer
              type="symbol"
              layout={{ "icon-image": "mb-logo" }}
              >
                  {(selectedStop ?
                [{...selectedStop},
                    ...Object
                    .values(selectedStop.related)] : [])
                    .map(({id, lat, lng, name}) =>
                    <Feature
                        key={id}
                        coordinates={[lng, lat]}
                        onScroll={e => console.log(e) || e}
                        onClick={(() => handleSelectedMarker(id))}
                        >{`[${id}] - ${name}`}</Feature>)
              }
          </Layer>
    {/* {(selectedStop ?
      [{...selectedStop},
          ...Object
          .values(selectedStop.related)] : [])
          .map(({id, lat, lng, name}) =>
          <GMarker
              key={id}
              coordinates={[lng, lat]}
              onScroll={e => console.log(e) || e}
              onClick={(() => console.log(id,stops) || this.setState({selectedStop: stops[id]}))}
              >{`[${id}] - ${name}`}</GMarker>) */}
    }
</GMap>

export default Map
