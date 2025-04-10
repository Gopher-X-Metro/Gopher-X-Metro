import Data from "src/backend/Data";
import Network from "src/backend/Network";

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
        
        setInterval(() => {
            RouteUpdater.instance.update();
            VehicleUpdater.instance.update();
        }, 500);
    }

    public addRoute(routeId : string) : void {
        console.log(Network.instance.getPeakStops("111026"))
        RouteLoader.instance.load(routeId);
    }

    public removeRoute(routeId : string) : void {
        RouteLoader.instance.unload(routeId);
    }
}

abstract class Loader {
    abstract load(arg: string) : void;
    abstract unload(arg: string) : void;
}

abstract class Updater {
    abstract update(...arg : any[]) : void;
}

class RouteLoader extends Loader {
    static #instance: RouteLoader;

    private constructor() { super(); }

    public static get instance(): RouteLoader {
        if (!RouteLoader.#instance) {
            RouteLoader.#instance = new RouteLoader();
        }

        return RouteLoader.#instance;
    }

    public load(routeId: string) : void {
        if (!RouteUpdater.instance.routes.has(routeId)) {
            RouteUpdater.instance.routes.add(routeId);
            PathLoader.instance.load(routeId);
            StopLoader.instance.load(routeId);
        } else {
            console.warn(`Route '${routeId}' is already in the Service!`);
        }
    }

    public unload(routeId: string) : void {
        if (RouteUpdater.instance.routes.has(routeId)) {
            RouteUpdater.instance.routes.delete(routeId);
            PathLoader.instance.unload(routeId);
            StopLoader.instance.unload(routeId);
        } else {
            console.warn(`Route '${routeId}' does not exist in the Service!`);
        }
    }
}

class PathLoader extends Loader {
    static #instance: PathLoader;
    static #paths: Map<string, Promise<Array<google.maps.Polyline> | undefined>>;

    private constructor() { super(); }

    public static get instance(): PathLoader {
        if (!PathLoader.#instance) {
            PathLoader.#instance = new PathLoader();
            PathLoader.#paths = new Map<string, Promise<Array<google.maps.Polyline> | undefined>>();
        }

        return PathLoader.#instance;
    }

    public load(routeId: string) : void {
        if (!PathLoader.#paths.has(routeId)) {
            const polyline = Data.instance.getPaths(routeId)
            .then(paths => paths?.map(path => new window.google.maps.Polyline({
                path: path.points.map(point => new google.maps.LatLng(point.lat, point.lng)),
                geodesic: true,
                strokeColor: "#000000",
                strokeOpacity: 1.0,
                strokeWeight: Number(process.env.REACT_APP_LINE_NORMAL),
                map: Service.map,
                zIndex: -1
            })));

            PathLoader.#paths.set(routeId, polyline);
        } else {
            PathLoader.#paths.get(routeId)?.then(
                paths => paths?.forEach(path => {
                    path.setVisible(true);
                })
            )
        }
    }

    public unload(routeId: string) : void {
        if (PathLoader.#paths.has(routeId)) {
            PathLoader.#paths.get(routeId)?.then(
                paths => paths?.forEach(path => {
                    path.setVisible(false);
                })
            )
        } else {
            console.warn(`Path '${routeId}' does not exist in the Service!`);
        }
    }
}


class StopLoader extends Loader {
    static #instance: StopLoader;
    static #stops: Map<string, Promise<Array<google.maps.Circle> | undefined>>;

    private constructor() { super(); }

    public static get instance(): StopLoader {
        if (!StopLoader.#instance) {
            StopLoader.#instance = new StopLoader();
            StopLoader.#stops = new Map<string, Promise<Array<google.maps.Circle> | undefined>>();
        }

        return StopLoader.#instance;
    }

    public load(routeId: string) : void {
        if (!StopLoader.#stops.has(routeId)) {
            // const polyline = Data.instance.getPaths(routeId)
            // .then(paths => paths?.map(path => new window.google.maps.Polyline({
            //     path: path.points.map(point => new google.maps.LatLng(point.lat, point.lng)),
            //     geodesic: true,
            //     strokeColor: "#000000",
            //     strokeOpacity: 1.0,
            //     strokeWeight: Number(process.env.REACT_APP_LINE_NORMAL),
            //     map: Service.map,
            //     zIndex: -1
            // })));

            // StopLoader.#stops.set(routeId, polyline);
        } else {
            StopLoader.#stops.get(routeId)?.then(
                paths => paths?.forEach(path => {
                    path.setVisible(true);
                })
            )
        }
    }

    public unload(routeId: string) : void {
        if (StopLoader.#stops.has(routeId)) {
            StopLoader.#stops.get(routeId)?.then(
                paths => paths?.forEach(path => {
                    path.setVisible(false);
                })
            )
        } else {
            console.warn(`Path '${routeId}' does not exist in the Service!`);
        }
    }
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