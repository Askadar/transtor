import React, { Component } from 'react';
import axios from 'axios';
import {  withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"
import { MarkerClusterer } from 'react-google-maps/lib/components/addons/MarkerClusterer';

import logo from './logo.svg';
import './App.css';

const precision = 1e5;
const Map = withScriptjs(withGoogleMap(({stops}) =>
<GoogleMap
    defaultZoom={12}
    defaultCenter={{ lat: 53.9006102, lng: 27.5623241 }}
	>
	<MarkerClusterer
    //   onClick={props.onMarkerClustererClick}
      averageCenter
      enableRetinaIcons
      gridSize={60}
    >
		{stops
			.map(({lat, lng, ...rest}) => ({lat: lat/precision, lng: lng/precision, ...rest}))
			.filter(({lat, lng}) => lat !== 0 || lng !== 0)
			.map(({id, lat, lng, name}) =>
			<Marker
				position={{lat, lng}}
				label={`${id} - ${name}`}
			/>
		)}
	</MarkerClusterer>
</GoogleMap>))

class App extends Component {
	state = {
		rows: [],
		header: [],
		rRows: [],
		rHeader: [],
        stops: {},
        selectedStop: null
	}
	componentDidMount(){
		axios.get('/stops.txt')
			.then(resp => {
				const { data } = resp;
				let rows = data.split('\n');
				let header = rows.splice(0,1)[0];
                let stops = {}
                // basic object
                rows
                    .map(row => row.split(';'))
                    .forEach(([id, city, area, street, name, info, lng, lat, rawStops, stopnum, garbo]) =>{
                        if (!id)
                            return;
                        stops[id] = {
                            id, city, area, street, name, info, lng, lat, rawStops, stopnum
                    }
                })
                // linked object
                Object.values(stops).forEach(stop => {
                    stop.rawStops.split(',')
                    .filter(a => a.length > 0)
                    .forEach(connectedStop => {
                            if (!connectedStop)
                                return;
                            stops[connectedStop].related = stops[connectedStop].related || {};
                            stops[connectedStop].related[stop.id] = stop;
                            stop.related = stop.related || {};
                            stop.related[connectedStop] = stops[connectedStop];
                            if (!stop.name && stop.related[0] && stop.related[0].name)
                                stop.name = stop.related[0].name;
                        }
                    )
                })
				// console.log([header, data]);
				this.setState({
                    stops,
					header: header.split(';'),
					rows: rows
                        .sort((a, b) => +a[0] - +b[0])
						.filter((r, i) => i < 50)
				});
			})
			.catch(err => console.warn(err));
		axios.get('/routes.txt')
			.then(resp => {
				const { data } = resp;
				let rows = data.split('\n');
				let header = rows.splice(0,1)[0];
				// console.log([header, data]);
				this.setState({
					rHeader: header.split(';'),
					rRows: rows
						.map( row => row.split(';'))
                        .sort((a, b) => +a[12] - +b[12])
						.filter((r, i) => i < 50)
				});
			})
			.catch(err => console.warn(err));
	}
	render() {
		const { rows, header, rHeader, rRows, stops, selectedStop } = this.state;
		return (<div className="App">
            <style>
                {`td {
                    border-bottom: 1px solid blue;
                    cursor: pointer;
                }`}
            </style>
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo"/>
				<h1 className="App-title">Welcome to React</h1>
			</header>
				<Map
					  isMarkerShown
					  googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places"
					  loadingElement={<div style={{ height: `100%` }} />}
					  containerElement={<div style={{ height: `800px` }} />}
					  mapElement={<div style={{ height: `100%` }} />}
                      stops={selectedStop ?
                          [{...selectedStop},
                              ...Object
                              .values(selectedStop.related)] : []
                      }
					>
				</Map>
			<div>
				<table>
					<thead></thead>
					<tbody>
						<tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Lng</th>
                            <th>Lat</th>
                            <th>Related</th>
						</tr>
						{Object.values(stops)
                            .filter((a,i) => i < 900)
                            .map(({id, name, lat, lng, related}) => {
							return(
                                <tr key={id}
                                    onClick={
                                    () => this.setState({selectedStop: stops[id]})
                                }>
                                    <td>{id}</td>
                                    <td>{name}</td>
                                    <td>{lng}</td>
                                    <td>{lat}</td>
                                    <td>
                                        {
                                            Object.values(related)
                                            .map(
                                                ({name: rName, lng: rLng, lat: rLat}) =>
                                            `${rName} - ${rLng}:${rLat}`
                                        )}
                                    </td>
    							</tr>)
						})}
					</tbody>
				</table>
				{/* <table>
					<thead></thead>
					<tbody>
						<tr>
							{rHeader.map(title => <th key={title}>{title}</th>)}
						</tr>
						{rRows.map(row => {
							return <tr key={row[0]}>
								{row.map((cell, i) => <td key={row[0] + i}>{cell}</td>)}
							</tr>
						})}
					</tbody>
				</table> */}
			</div>
		</div>);
	}
}

export default App;
