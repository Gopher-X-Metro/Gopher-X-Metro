import Resources from "../backend/Resources.ts";
import URL from "../backend/URL.ts";
import Route from "./elements/Route.ts";

namespace Routes {
    // Sets the map for the routes
    export function setMap(_map : google.maps.Map) : void { map = _map; }

    // Gets a route from the hashmap
    export function getRoute(routeId : string) : Route | undefined { return routes.get(routeId); }

    // Sets a route's visibility
    export function setVisible(routeId : string, visible : boolean) {
        getRoute(routeId)?.getPaths().forEach(path => path.getLine().setVisible(visible));
        getRoute(routeId)?.getStops()?.forEach(stop => stop.getMarker().setVisible(visible));
        getRoute(routeId)?.getVehicles().forEach(vehicle => vehicle.getMarker().setVisible(visible));
    }

    // Sets a route's thickness
    export function setBolded(routeId : string, bolded : boolean) {
        getRoute(routeId)?.getPaths()?.forEach(paths => paths.getLine().set("strokeWeight", bolded ? process.env.REACT_APP_LINE_BOLD : process.env.REACT_APP_LINE_NORMAL));
    }


    // Refreshes the routes after the change of the url
    export function refresh() {
        // Goes through each route that is not on the URL, and hides it
        routes.forEach(routeId => {
            if (URL.getRoutes().indexOf(routeId.getId()) === -1) {
                setVisible(routeId.getId(), false);
            }
        })
        
        // Goes through each route that is on the URL, and unhides it or creates it
        URL.getRoutes().forEach(routeId => {
            if (!routes.has(routeId)){ 
                loadRoute(routeId);
            }
            setVisible(routeId, true)
        })
    }

    // Loads a route into the routes list
    async function loadRoute(routeId: string) {
        const route = new Route(routeId);

        routes.set(routeId, route);

        // Load paths
        Resources.getShapeIds(routeId).forEach(async shapeId => {
            // Add path
            route.addPath(routeId, shapeId, "", Resources.getColor(routeId), Resources.getShapeLocations(shapeId), map)
                        
            // If the user hovers over the line, change the width
            route.getPaths().get(shapeId)?.getLine().addListener("mouseover", () => setBolded(route.getId(), true));
            
            // If the user stops hovering over the line, return back
            route.getPaths().get(shapeId)?.getLine().addListener("mouseout", () => setBolded(route.getId(), false));      
        })

        // Load Stops
        Resources.getTripIds(routeId).forEach(async tripId => {
            // Gets stop times
            const stopTimes = Resources.getStopTimes(tripId);

            // Create the routes
            Resources.getStopIds(tripId).forEach(stopId => {
                // Creates the stop if it has not been created yet
                if (!route.getStops().has(stopId)) {
                    // Create stop
                    route.addStop(routeId, stopId, "#0022FF", Resources.getStopLocation(stopId), map);
                    
                    // If the user hovers over the stop, change the width of the line
                    route.getStops().get(stopId)?.getMarker().addListener("mouseover", () => {
                        setBolded(route.getId(), true)
                    });
                    
                    // If the user stops hovering over the stop, return back
                    route.getStops().get(stopId)?.getMarker().addListener("mouseout", () => {
                        setBolded(route.getId(), false)
                    }); 
                }
                // Adds the stop time to the stop
                route.getStops().get(stopId)?.addStopTime(tripId, stopTimes.get(stopId)?.at(1), stopTimes.get(stopId)?.at(2))
            })
        })
    }

    const routes = new Map<string, Route>();
    let map : google.maps.Map;
}

export default Routes;