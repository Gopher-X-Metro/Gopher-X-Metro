import Data from "src/backend/Data";

export default class Service {
    static #instance: Service;
    static #map: google.maps.Map;

    private constructor() {}

    static link(map : google.maps.Map) {
        this.#map = map;
    }

    public static get map() : google.maps.Map {
        return Service.#map;
    }

    public static get instance(): Service {
        if (!Service.#instance) {
            Service.#instance = new Service();
        }

        return Service.#instance;
    }

    public run() : void {
        if (!Service.#map) {
            throw Error("Service does not have a linked map!");
        }

        this.addRoute("121");
        this.addRoute("120");
        this.addRoute("901");

        setInterval(() => {
            RouteUpdater.instance.update();
            VehicleUpdater.instance.update();
        }, 500);
    }

    private addRoute(routeId : string) : void {
        Loader.instance.loadRoute(routeId);
    }

    private removeRoute(routeId : string) : void {

    }
}

class Loader {
    static #instance: Loader;
    static #routes: Set<string>;

    private constructor() {}

    public static get instance(): Loader {
        if (!Loader.#instance) {
            Loader.#instance = new Loader();
        }

        return Loader.#instance;
    }

    public loadRoute(routeId: string) : void {
        if (!RouteUpdater.instance.routes.has(routeId)) {
            RouteUpdater.instance.routes.add(routeId);
            RouteUpdater.instance.paths.set(routeId, new Set<google.maps.Polyline>());
            Data.instance.getPaths(routeId)
            .then(paths => {
                if (paths) {
                    for (const path of paths) {
                        const polyline = new window.google.maps.Polyline({
                            path: path.points.map(point => new google.maps.LatLng(point.lat, point.lng)),
                            geodesic: true,
                            strokeColor: "#000000",
                            strokeOpacity: 1.0,
                            strokeWeight: Number(process.env.REACT_APP_LINE_NORMAL),
                            map: Service.map,
                            zIndex: -1
                        });

                        RouteUpdater.instance.paths.get(routeId)?.add(polyline);
                    }
                }
            })
        } else {
            console.warn(`Route \'${routeId}\' is already in the Service!`);
        }
    }

    public unloadRoute(routeId: string) : void {
        if (RouteUpdater.instance.routes.has(routeId)) {
            RouteUpdater.instance.routes.delete(routeId);
            RouteUpdater.instance.paths.get(routeId)?.forEach(path => {
                path.setVisible(false);
            })
        } else {
            console.warn(`Route \'${routeId}\' does not exist in the Service!`);
        }
    }
}

abstract class Updater {
    abstract update(...arg : any[]) : void;
}

class RouteUpdater extends Updater {
    static #instance: RouteUpdater;
    static #routes: Set<string>;
    static #paths: Map<string, Set<google.maps.Polyline>>;

    private constructor() { super(); }

    public static get instance(): RouteUpdater {
        if (!RouteUpdater.#instance) {
            RouteUpdater.#instance = new RouteUpdater();
            RouteUpdater.#routes = new Set<string>();
            RouteUpdater.#paths = new Map<string, Set<google.maps.Polyline>>();
        }

        return RouteUpdater.#instance;
    }

    public get routes() : Set<string> {
        return RouteUpdater.#routes;
    }

    public get paths() : Map<string, Set<google.maps.Polyline>> {
        return RouteUpdater.#paths;
    }

    public update() : void {
        for (const routeId of RouteUpdater.#routes) {
            // console.log()
        }
    }
}

class VehicleUpdater extends Updater {
    static #instance: VehicleUpdater;

    private constructor() { super(); }

    public static get instance(): VehicleUpdater {
        if (!VehicleUpdater.#instance) {
            VehicleUpdater.#instance = new VehicleUpdater();
        }

        return VehicleUpdater.#instance;
    }

    public update() : void {
        
    }
}