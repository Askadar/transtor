import { observable, computed } from 'mobx';

export class Pathing {
    @observable stops = {};
    @observable routes = {};
    @observable selectedRoute = {
        a: '',
        b: '',
    };
    @computed get availableRoutes () {
        console.log(['computed routes', this, window.google]);
    };
}

export class Main {
    @observable search = ''
}
