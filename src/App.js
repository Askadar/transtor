import React, { Component } from 'react';
import axios from 'axios';
import Rx from 'rxjs/Rx';
import { observer, inject } from 'mobx-react';
import { observable } from 'mobx';
import { getObjectValues } from './utils';

import Map from './Map';
// import SearchBox from "react-google-maps/lib/components/places/SearchBox";
import Overlay from './Overlay';
// import { MarkerClusterer } from 'react-google-maps/lib/components/addons/MarkerClusterer';


import logo from './logo.svg';
import './App.css';

const precision = 1e5;

@inject('Pathing', 'Main') @observer
class App extends Component {
    constructor(p){
        super(p);
        this.state = {
    		rows: [],
    		header: [],
    		rRows: [],
    		rHeader: [],
            stops: {},
            selectedStop: null,
            mapboxCenter: [27.5623241, 53.9006102],
    	}
    }

	componentDidMount(){
        const { Pathing } = this.props;
		axios.get('/stops.txt')
			.then(resp => {
				const { data } = resp;
				let rows = data.split('\n');
                let header = rows.splice(0,1)[0];
                // const $dataStream = Rx.Observable.of(...rows).bufferCount(50);
                // const $timer = Rx.Observable.interval(20);
                // const $zip = Rx.Observable.zip($dataStream,$timer).flatMap(both => both[0])
                // const rxRef = this;
                rows = rows
                    .map(rawRow => rawRow.split(';'))
                    .map(
                        ([id, city, area, street, name, info, lng, lat, rawStops, stopnum, garbo]) =>
                        ({id, city, area, street, name, info, lng: lng/precision, lat: lat/precision, rawStops, stopnum})
                    );
                rows
                    .forEach((row, index) =>{
                            if (!row.id)
                                return;
                            let name = row.name;
                            if(name === '')
                                name = Pathing.stops[rows[index-1].id].name;
                            Pathing.stops[row.id] = {...row, name};
                    })
                getObjectValues(Pathing.stops).forEach(stop => {
                    stop.rawStops
                        .split(',')
                        .forEach(connectedStop => {
                            Pathing.stops[stop.id].related = Pathing.stops[stop.id].related || observable.ref();
                            if (!connectedStop)
                                return;
                            Pathing.stops[connectedStop].related = Pathing.stops[connectedStop].related || observable.ref();
                            Pathing.stops[connectedStop].related[stop.id] = Pathing.stops[stop.id];
                            Pathing.stops[stop.id].related[connectedStop] = Pathing.stops[connectedStop];
                        }
                    )
                })
                this.buildRoutes();
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
                    .filter(a => a.id && a.rawStops !== '')
                    .map(({ rawStops, ...row}) => ({ ...row, connectedStops: rawStops.split(',')  }))
            let routes = rows.reduce((_routes, route, tempo) => {
                this.props.Pathing.routes[route.id] = {...route};

                this.props.Pathing.routes[route.id].connectedStops = observable.ref();
                route.connectedStops = route.connectedStops.reduce((cStops, stopId, i) => {
                    // this.state[stopId].inRoutes = [] || this.state[stopId].inRoutes;

                    this.props.Pathing.routes[route.id].connectedStops[stopId] =
                    this.props.Pathing.stops[stopId];
                    cStops[stopId] = this.state.stops[stopId]

                    this.props.Pathing.stops[stopId].inRoutes = this.props.Pathing.stops[stopId].inRoutes || observable.ref();
                    this.props.Pathing.stops[stopId].inRoutes[route.id] = this.props.Pathing.routes[route.id];
                    // this.state[stopId].inRoutes.push([route, i]);
                    return cStops;
                }, {})
                _routes[route.id] = route;
                return _routes;
            }, {})
            console.log('finita');
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
		const { Pathing, Main } = this.props;
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
                  containerElement={<div style={{ height: `calc(100vh - 240px)` }} />}
                  mapElement={<div style={{ height: `100%` }} />}
                  updateSelectFromMarker={id => this.setState({selectedStop: Pathing.stops[id]})}
                  stops={Pathing.availableRoutes && Pathing.availableRoutes.availableStops ? Pathing.availableRoutes.availableStops : []}
                  routes={Pathing.availableRoutes}
                  onClick={a => Pathing.selectedRoute.a = a.latLng}
                  onRightClick={b => Pathing.selectedRoute.b = b.latLng}
                >
            </Map>
            </div>
            <Overlay
                search={Main.search}
                handleSearchChanged={value => Main.searchChanged(Pathing, value)}
                routes={Pathing.availableRoutes}
                >

            </Overlay>
            {/* <Table
                stops={this.props.Pathing.stops}
                selecte
                visible
                handleSelectedStop={(id) => this.setState({selectedStop: Pathing.stops[id]})}
            /> */}
		</div>);
	}
}
@observer
class Table extends Component {
    shouldComponentUpdate(newProps){
        return Object.keys(this.props.stops).length !== Object.keys(newProps.stops).length;
    }
    render() {
        const {stops, handleSelectedStop, visible} = this.props;
        console.log('table rendered with ', stops);
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
                    {getObjectValues(stops)
                        // .filter((a,i) => i < 50)
                        .filter(a => a&& a.id && a.name)
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
                                        getObjectValues(related)
                                        .filter(a => a && a.id && a.name)
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
