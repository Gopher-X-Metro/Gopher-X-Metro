import Data from "src/backend/Data";

export default class Service {
    static #instance: Service;
    static #map: google.maps.Map;

    static link(map : google.maps.Map) {
        this.#map = map;
    }

    private constructor() {}

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
                        map: Service.#map,
                        zIndex: -1
                    });
                }
            }
        })
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
        } else {
            console.warn(`Route \'${routeId}\' is already in the Service!`);
        }
    }
}

abstract class Updater {
    abstract update(...arg : any[]) : void;
}

class RouteUpdater extends Updater {
    static #instance: RouteUpdater;
    static #routes: Set<string>;

    private constructor() { super(); }

    public static get instance(): RouteUpdater {
        if (!RouteUpdater.#instance) {
            RouteUpdater.#instance = new RouteUpdater();
            RouteUpdater.#routes = new Set<string>();
        }

        return RouteUpdater.#instance;
    }

    public get routes() : Set<string> {
        return RouteUpdater.#routes;
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