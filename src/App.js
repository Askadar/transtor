import React, { Component } from 'react';
import axios from 'axios';
import Rx from 'rxjs/Rx';
import { observer } from 'mobs-react';

import Map from './Map';
// import { MarkerClusterer } from 'react-google-maps/lib/components/addons/MarkerClusterer';


import logo from './logo.svg';
import './App.css';

const precision = 1e5;

@observer
class App extends Component {
	state = {
		rows: [],
		header: [],
		rRows: [],
		rHeader: [],
        stops: {},
        selectedStop: null,
        mapboxCenter: [27.5623241, 53.9006102],
	}
	componentDidMount(){
		axios.get('/stops.txt')
			.then(resp => {
				const { data } = resp;
				let rows = data.split('\n');
                let header = rows.splice(0,1)[0];
                const $dataStream = Rx.Observable.of(...rows).bufferCount(50);
                const $timer = Rx.Observable.interval(20);
                const $zip = Rx.Observable.zip($dataStream,$timer).flatMap(both => both[0])
                const rxRef = this;
                $zip
                    .map(rawRow => rawRow.split(';'))
                    .map(
                        ([id, city, area, street, name, info, lng, lat, rawStops, stopnum, garbo]) =>
                        ({id, city, area, street, name, info, lng: lng/precision, lat: lat/precision, rawStops, stopnum})
                    )
                    .reduce((stops, row, index) =>{
                            if (!row.id)
                                return stops;
                            let name = row.name;
                            if(name === '')
                                name = Object.values(stops).slice(-1)[0].name;
                            stops[row.id] = {...row, name};
                            return stops;
                    }, {})
                    .map(stops => {
                        Object.values(stops).forEach(stop => {
                            stop.rawStops
                                .split(',')
                                .forEach(connectedStop => {
                                        stop.related = stop.related || {};
                                        if (!connectedStop)
                                            return;
                                        stops[connectedStop].related = stops[connectedStop].related || {};
                                        stops[connectedStop].related[stop.id] = stop;
                                        stop.related[connectedStop] = stops[connectedStop];
                                    }
                                )
                        })
                        return stops;
                    })
                    .subscribe(stops => {
                        rxRef.buildRoutes();
                        rxRef.setState({stops})
                    });
				this.setState({
                    // stops,
					header: header.split(';'),
					rows: rows
                        // .sort((a, b) => +a[0] - +b[0])
						.filter((r, i) => i < 50)
				});
			})
			.catch(err => console.warn(err));

	}
    buildRoutes(){
        axios.get('/routes.txt')
            .then(resp => {
                const { data } = resp;
                let rows = data.split('\n');
                let header = rows.splice(0,1)[0];
                rows = rows
                    .map(row => row.split(';'))
                    .map(([rn, a, city, transport, operator, validityPeriods, specialDates, routeTag, routeType, commercial, routeName, weekdays, id, entry, rawStops, garb, date
                        ]) =>
                        ({rn, a, city, transport, operator, validityPeriods, specialDates, routeTag, routeType, commercial, routeName, weekdays, id, entry, rawStops, garb, date}))
                    .filter(a => a.id)
                    .map(({ rawStops, ...row}) => ({ ...row, connectedStops: rawStops.split(',')  }))
            let routes = rows.reduce((_routes, route) => {
                route.connectedStops = route.connectedStops.reduce((cStops, stopId, i) => {
                    // this.state[stopId].inRoutes = [] || this.state[stopId].inRoutes;
                    cStops[stopId] = this.state.stops[stopId]
                    // this.state[stopId].inRoutes.push([route, i]);
                    return cStops;
                }, {})
                _routes[route.id] = route;
                return _routes;
            }, {})
            console.log(routes);
            this.setState({
                rHeader: header.split(';'),
                rRows: rows,
                routes
            });
        })
        .catch(err => console.warn(err));
    }
	render() {
		const { header, stops, selectedStop, mapboxCenter } = this.state;
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
			<div>
            <Map
                  isMarkerShown
                  googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places"
                  loadingElement={<div style={{ height: `100%` }} />}
                  containerElement={<div style={{ height: `calc(100vh - 200px)` }} />}
                  mapElement={<div style={{ height: `100%` }} />}
                  updateSelectFromMarker={id => this.setState({selectedStop: stops[id]})}
                  stops={selectedStop ?
                    [{...selectedStop},
                        ...Object
                        .values(selectedStop.related)] : []
                  }
                >
            </Map>
            </div>

            <Table
                stops={stops}
                visible
                handleSelectedStop={(id) => this.setState({selectedStop: stops[id]})}
            />
		</div>);
	}
}
class Table extends Component {
    shouldComponentUpdate(newProps){
        return this.props.stops !== newProps.stops;
    }
    render() {
        const {stops, handleSelectedStop, visible} = this.props;
        return (
            <table style={{width: '80vw', display: visible ? 'table' : 'none'}}>
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
                        // .filter((a,i) => i < 50)
                        .map(({id, name, lat, lng, related, city, area, street}) => {
                        return(
                            <tr key={id}
                                onClick={
                                () => handleSelectedStop(id)
                            }>
                                <td>{id}</td>
                                <td>{name}</td>
                                <td>{lng}</td>
                                <td>{lat}</td>
                                <td><pre>
                                    {
                                        Object.values(related)
                                        .map(
                                            ({name: rName, id: rId}) =>
                                        `${rName}[${rId}]`
                                    ).join(', \n')}
                                </pre></td>
                            </tr>)
                    })}
                </tbody>
            </table>
        )
    }
}


export default App;
