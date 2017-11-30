import React from 'react';
import {  withScriptjs, withGoogleMap, GoogleMap, Marker, Polyline } from 'react-google-maps';

import Route from './Route';
import { getObjectValues } from '../utils';

@withScriptjs @withGoogleMap
class Map extends React.Component {
    constructor(p){
        super(p);
        this.state = {
            directions: null
        }
    }
    componentDidMount(){
        this.DirectionsService = new window.google.maps.DirectionsService();
    }
    componentWillReceiveProps(props){
        const { steps } = props;
        if (steps.length === 0)
            return
        let from = steps[0];
        let fromI = steps[1].connectedStops.findIndex(a => a.id === steps[0].id);
        let to = steps[4] ? steps[4] : steps[2];
        let toI = steps[1].connectedStops.findIndex(a => a.id === steps[2].id);
        let waypoints = [];
        const waypointConvert = ({lat, lng}) => ({location: {lat, lng}})
        waypoints.concat(
            steps[1].connectedStops
                .filter((_, i) => i >= fromI && i <= toI).map(waypointConvert)
        )
        if (steps[3]){
            fromI = steps[3].connectedStops.findIndex(a => a.id === steps[2].id);
            toI = steps[3].connectedStops.findIndex(a => a.id === steps[4].id);
            waypoints.concat(
                steps[3].connectedStops
                    .filter((_, i) => i >= fromI && i <= toI).map(waypointConvert)
            )
        }
        this.DirectionsService.route({
            origin: {lat: from.lat, lng: from.lng},
            destination: {lat: to.lat, lng: to.lng},
            waypoints,
            travelMode: window.google.maps.TravelMode.DRIVING,
        }, (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
            this.setState({
                directions: result,
            });
        } else {
        console.error(`error fetching directions ${result}`);
        }
        });
    }
    render(){
        const {stops, steps, route, updateSelectFromMarker, ...rest} = this.props;
        const { directions } = this.state;
        return (
            <GoogleMap
            defaultZoom={12}
            defaultCenter={{ lat: 53.9006102, lng: 27.5623241 }}
            {...rest}
        	>
                <Route steps={steps} directions={directions}></Route>
        		{/*stops
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
                    // .filter((a,b) => b < 10)
                    .map((_route, i) => {
                        const color = Math.round(Math.random()*255);
                        const width = Math.round(Math.random()*25);
                        return (<div key={i}>
                    <Polyline
                        options={{
                            geodesic: true,
                            strokeWeight: width,
                            strokeColor: `hsla(${color}, 35%, 35%, 0.5)`
                        }}
                        path={getObjectValues(_route[1].connectedStops)
                            .filter((a, i) => i >= _route[1].connectedStops.findIndex(a=>a.id === _route[0].id) &&  i <= _route[1].connectedStops.findIndex(a=>a.id === _route[2].id))
                            .map(({lat, lng})=> ({lat, lng}))}>
                    </Polyline>
                    {_route[3] && <Polyline
                        options={{
                            geodesic: true,
                            strokeWeight: width,
                            strokeColor: `hsla(${color}, 80%, 80%, 0.3)`
                        }}
                        path={getObjectValues(_route[3].connectedStops)
                            .filter((a, i) => i >= _route[3].connectedStops.findIndex(a=>a.id === _route[2].id) &&  i <= _route[3].connectedStops.findIndex(a=>a.id === _route[4].id))
                            .map(({lat, lng})=> ({lat, lng}))}>
                    </Polyline>}
                    { <Marker
                        position={{lat: _route[0].lat, lng: _route[0].lng}}
                        opacity={0.5}
                        label={`From[${_route[0].id}]`}
                    />
                    <Marker position={{lat: _route[2].lat, lng: _route[2].lng}}
                        label={`To?[${_route[2].id}]{${i}}`}
                    />
                    {_route[4] && <Marker opacity={0.5} position={{lat: _route[4].lat, lng: _route[4].lng}}
                        label={`To[${_route[4].id}]`}
                    />} }
                </div>)})
                */}
                {route && route.from && <Marker key="A" position={route.from} label="A"/>}
                {route && route.to && <Marker key="B" position={route.to} label="B"/>}
        </GoogleMap>)
    }
}

export default Map;
