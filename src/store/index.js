import { observable, computed } from 'mobx';
import { toRad, getObjectValues } from '../utils';

export class Pathing {
    @observable stops = {};
    @observable routes = {};
    @observable selectedPoints = {
        a: null,
        b: null,
    };
    @observable selectedRoute = 0
    @computed get availableRoutes () {
        console.log(['computed routes', this, window.google]);
        const { a, b } = this.selectedPoints;
        let route = { from: null, to: null };
        if (a)
            route.from = {lat: a.lat(), lng: a.lng()}
        if (b)
            route.to = {lat: b.lat(), lng: b.lng()}
        if (a && b) {
            const getBoundingBox = ({lat, lng}, meterPrecision = 0.2) => {
                const latPrecision = (1/110.574)
                const latDelta = (latPrecision * meterPrecision);
                const lngPrecision = ( 1/( 111.320 * Math.cos( toRad(lat) ) ) )
                const lngDelta = (lngPrecision * meterPrecision);
                return {
                    minLat: lat - latDelta,
                    maxLat: lat + latDelta,
                    minLng: lng - lngDelta,
                    maxLng: lng + lngDelta,
                }
            }
            const aBoundingBox = getBoundingBox(route.from);
            const bBoundingBox = getBoundingBox(route.to);
            console.log(['bounding boxes', aBoundingBox, bBoundingBox]);
            // console.log('start', performance.now());
            const stopsFrom = Object.values(this.stops).filter(stop => stop && stop.lat > aBoundingBox.minLat &&  stop.lat < aBoundingBox.maxLat &&  stop.lng > aBoundingBox.minLng &&  stop.lng < aBoundingBox.maxLng)
            const stopsTo = Object.values(this.stops).filter(stop => stop && stop.lat > bBoundingBox.minLat &&  stop.lat < bBoundingBox.maxLat &&  stop.lng > bBoundingBox.minLng &&  stop.lng < bBoundingBox.maxLng)
            // console.log('stop', performance.now());
            const findSuitableRoutes = (steps, currentVector, deepness = 1) => {
                const getLatLngAbsDistance = (from, to) => {
                    var φ1 = toRad(from.lat), φ2 = toRad(to.lat), Δλ = toRad(to.lng-from.lng), R = 6371e3; // gives d in metres
var d = Math.acos( Math.sin(φ1)*Math.sin(φ2) + Math.cos(φ1)*Math.cos(φ2) * Math.cos(Δλ) ) * R;
                    return Math.abs(d);
                }
                let from = steps[0];
                let to = steps.slice(-1)[0];
                const distanceLimit = stop => (
                    getLatLngAbsDistance(from, to) >= getLatLngAbsDistance(stop, to)
                    && getLatLngAbsDistance(from, to) >= getLatLngAbsDistance(stop, from)
            )
                /*
                var Route = steps = [
                        Stop from,
                        Route from.inRoutes[x],
                        ?Metro ?Stop from.inRoutes[x].connectedStops[x]
                        ?Route from.inRoutes[x].connectedStops[x].inRoutes[y]
                        ?Metro ?Stop from.inRoutes[x].connectedStops[x]
                        Route?from.inRoutes[x].connectedStops[x].inRoutes[y]
                        Stop from.inRoutes[x](.connectedStops[x].inRoutes[y].).connectedStops[y] === to
                    ]
                */
                if (deepness > 2 && !steps.some(step => step.metro) && deepness < 4)
                    return null;
                else {
                    if (deepness < 3) {
                        if (
                            getObjectValues(currentVector.connectedStops)
                            .filter(distanceLimit)
                            .some(stop => stop.id === steps.slice(-1)[0].id)
                        )
                            return [[
                                ...steps.slice(0, -1),
                                currentVector,
                                ...steps.slice(-1)
                            ]];
                        // return null;
                        // return [
                        //     route
                        //     route
                        //     ...
                        // ];

                        return getObjectValues(currentVector.connectedStops)
                        .filter(distanceLimit)
                        .map(stop =>
                            getObjectValues(stop.inRoutes)
                            .map(nextRoute =>
                                findSuitableRoutes([
                                    ...steps.slice(0, -1),
                                    currentVector,
                                    stop,
                                    steps.slice(-1)[0]
                                ], nextRoute, deepness + 1)
                            ).filter(a => a && a.length > 0).reduce((flatter, route) => flatter.concat(route), [])
                        ).filter(a => a && a.length > 0).reduce((flatter, route) => flatter.concat(route), [])
                    }
                    return null
                    // return [...steps.slice(0, -1), currentVector, steps.slice(-1)[0]];
                }
            }
            const recursedMap = stopFrom => {
                return stopFrom.inRoutes ? getObjectValues(stopFrom.inRoutes).map(route =>
                    stopsTo.map(
                        stopTo => findSuitableRoutes([stopFrom, stopTo], route, 1)
                    ).filter(a => a && a.length > 0).reduce((flatter, route) => flatter.concat(route), [])
                ).filter(a => a && a.length > 0).reduce((flatter, route) => flatter.concat(route), []) : []
            }
            console.log('start', performance.now());
            const recursedRoutes = stopsFrom.map(recursedMap).filter(a => a && a.length > 0)
            console.log('finish', performance.now());
            const routableStopsFrom = stopsFrom.filter(st =>{
                return st.inRoutes &&
                getObjectValues(st.inRoutes).filter(route =>{
                    return getObjectValues(route.connectedStops)
                        .some(stop => stopsTo.find(stopTo => stopTo.id === stop.id))
                    }).length > 0
                })
            console.log([routableStopsFrom, stopsFrom, stopsTo, recursedRoutes]);

            return {
                from: route.from,
                to: route.to,
                routes: recursedRoutes.reduce((megaFlat, part) => megaFlat.concat(part), [])}
                // .map(route => );


        }
        if (a || b)
            return route;
        return null;
    };
}

export class Main {
    @observable search = ''
    @observable searchWarning = null
    @observable geocoder = null
    @observable log = []
    searchChanged(pathing, newSearch){
        this.search = newSearch;
        this.searchWarning = null;
        if (!this.geocoder)
            try {
                this.geocoder = this.geocoder || new window.google.maps.Geocoder()
            } catch (e) {
                this.searchWarning = `Geocoding API not available, can't use search function; `
                console.log(e);
            }
    }
}
