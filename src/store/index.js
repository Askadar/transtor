import { observable, computed } from 'mobx';
import { getObjectValues, getBoundingBox } from '../utils';

const findSuitableRoutesStaticAlgo = (fromArr, toArr) => {
    let stepsArr = [];
    fromArr
    .filter(a => a.inRoutes && a.inRoutes)
    .forEach(from => {
        getObjectValues(from.inRoutes).forEach(route => {
            let fromIndex = route.connectedStops.findIndex(a => a.id === from.id)
            stepsArr = stepsArr.concat(
                toArr.map(to => {
                    let toIndex = route.connectedStops.findIndex(a => a.id === to.id)
                    if (toIndex < fromIndex || toIndex < 0)
                        return null;
                    return [from, route, to];
                })
                .filter(a => a)
            )
        })
    })
    let promisedArr = new Promise(
        (resolve, reject) => {
            reject(new Error('Not implmented'));
            // let stepsArr = [];
            // fromArr.forEach(from => {
            //     getObjectValues(from.inRoutes).forEach(route => {
            //         let fromIndex = route.connectedStops.findIndex(a => a.id === from.id)
            //         route.connectedStops.slice(fromIndex).forEach(middleStop => {
            //
            //         })
            //     })
            // })
        }
    )
    return {
        simple: stepsArr.length === 0 ? [[]] : stepsArr,
        complex: promisedArr
    };
}

export class Pathing {
    @observable stops = {};
    @observable routes = {};
    @observable selectedPoints = {
        a: null,
        b: null,
    };
    @observable selectedRoute = 0
    reverseRoutePoints() {
        const { a: oldA, b: oldB } = this.selectedPoints;
        this.selectedPoints.a = oldB;
        this.selectedPoints.b = oldA;
    }
    @computed get availableRoutes () {
        // console.log(['computed routes', this, window.google]);
        const { a, b } = this.selectedPoints;
        let route = { from: null, routes: [[]], to: null };
        if (a)
            route.from = {lat: a.lat(), lng: a.lng()}
        if (b)
            route.to = {lat: b.lat(), lng: b.lng()}
        if (a && b) {
            const aBoundingBox = getBoundingBox(route.from);
            const bBoundingBox = getBoundingBox(route.to);
            // console.log(['bounding boxes', aBoundingBox, bBoundingBox]);
            // console.log('start', performance.now());
            const stopsFrom = getObjectValues(this.stops).filter(stop => stop && stop.lat > aBoundingBox.minLat &&  stop.lat < aBoundingBox.maxLat &&  stop.lng > aBoundingBox.minLng &&  stop.lng < aBoundingBox.maxLng)
            const stopsTo = getObjectValues(this.stops).filter(stop => stop && stop.lat > bBoundingBox.minLat &&  stop.lat < bBoundingBox.maxLat &&  stop.lng > bBoundingBox.minLng &&  stop.lng < bBoundingBox.maxLng)
            let routesBoth = findSuitableRoutesStaticAlgo(stopsFrom, stopsTo)
            routesBoth
                .complex
                .then(steps => /*doSome*/ null)
                .catch(err => null);
            ;
            return {
                from: route.from,
                to: route.to,
                routes: [...routesBoth.simple]
                // routes: recursedRoutes.reduce((megaFlat, part) => megaFlat.concat(part), [])}
                // .map(route => );
            }

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
