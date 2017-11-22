import { observable, computed } from 'mobx';
import { toRad, getObjectValues } from '../utils';

export class Pathing {
    @observable stops = {};
    @observable routes = {};
    @observable selectedRoute = {
        a: null,
        b: null,
    };
    @computed get availableRoutes () {
        console.log(['computed routes', this, window.google]);
        const { a, b } = this.selectedRoute;
        let route = { from: null, to: null };
        if (a)
            route.from = {lat: a.lat(), lng: a.lng()}
        if (b)
            route.to = {lat: b.lat(), lng: b.lng()}
        if (a && b) {
            const getBoundingBox = ({lat, lng}) => {
                const meterPrecision = 0.2;
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
            const stopsFrom = Object.values(this.stops).filter(stop => stop && stop.lat > aBoundingBox.minLat &&  stop.lat < aBoundingBox.maxLat &&  stop.lng > aBoundingBox.minLng &&  stop.lng < aBoundingBox.maxLng)
            const stopsTo = Object.values(this.stops).filter(stop => stop && stop.lat > bBoundingBox.minLat &&  stop.lat < bBoundingBox.maxLat &&  stop.lng > bBoundingBox.minLng &&  stop.lng < bBoundingBox.maxLng)
            const routableStopsFrom = stopsFrom.filter(st =>{
                return st.inRoutes &&
                getObjectValues(st.inRoutes).filter(route =>{
                    return getObjectValues(route.connectedStops)
                        .some(stop => stopsTo.find(stopTo => stopTo.id === stop.id))
                    }).length > 0
                })
            console.log([routableStopsFrom, stopsFrom, stopsTo]);
            route.availableStops = routableStopsFrom;

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
