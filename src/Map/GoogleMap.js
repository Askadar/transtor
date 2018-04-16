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
        const {stops, steps, route, updateSelectFromMarker, reverseRoutePoints, children, ...rest} = this.props;
        const { directions } = this.state;
        return (
            <GoogleMap
            defaultZoom={12}
            defaultCenter={{ lat: 53.9006102, lng: 27.5623241 }}
            {...rest}
        	>
                <Route steps={steps} directions={directions}></Route>
        		{route && route.from && <Marker key="A"
                    position={route.from}
                    label="A"
                    onClick={reverseRoutePoints}
                />}
                {route && route.to && <Marker key="B"
                    position={route.to}
                    label="B"
                    onClick={reverseRoutePoints}
                />}
            {children}
        </GoogleMap>)
    }
}

export default Map;
