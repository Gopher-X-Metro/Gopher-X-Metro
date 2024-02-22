import Resources from "../backend/Resources.ts";
import URL from "../backend/URL.ts";
import Route from "./elements/Route.ts";

namespace Routes {
    
    /* Public */
    
    /**
     * Refreshes the routes after the change of the url
     */
    export function refresh() {
        // Goes through each route that is not on the URL, and hides it
        routes.forEach(routeId => {
            if (!URL.getRoutes().has(routeId.getId())) setVisible(routeId.getId(), false);
        })
        
        // Goes through each route that is on the URL, and unhides it or creates it
        URL.getRoutes().forEach(routeId => {
            if (!routes.has(routeId)){ 
                loadRoute(routeId);
            }
            setVisible(routeId, true)
        })
    }
    /**
     * Gets a route object
     * @param routeId ID of the route
     */
    export function getRoute(routeId : string) : Route | undefined { return routes.get(routeId); }
    /**
     * Sets the map for the routes
     * @param _map map object
     */
    export function setMap(_map : google.maps.Map) : void { map = _map; }
    /**
     * Sets a route's visibility
     * @param routeId ID of route
     * @param visible should the route be visible
     */
    export function setVisible(routeId : string, visible : boolean) {
        getRoute(routeId)?.getPaths().forEach(path => path.getLine().setVisible(visible));
        getRoute(routeId)?.getStops()?.forEach(stop => stop.getMarker().setVisible(visible));
        getRoute(routeId)?.getVehicles().forEach(vehicle => vehicle.getMarker().setVisible(visible));
    }
    /**
     * Sets a route's boldedness
     * @param routeId ID of route
     * @param bolded should the route be boolded
     */
    export function setBolded(routeId : string, bolded : boolean) {
        getRoute(routeId)?.getPaths()?.forEach(paths => paths.getLine().set("strokeWeight", bolded ? process.env.REACT_APP_LINE_BOLD : process.env.REACT_APP_LINE_NORMAL));
    }


    /* Private */

    /**
     * Loads a route into the routes hash
     * @param routeId ID of the route
     */
    async function loadRoute(routeId: string) {
        const route = new Route(routeId, map);

        routes.set(routeId, route);

        // Load paths
        Resources.getShapeIds(routeId).forEach(async shapeId => {
            // Add path
            route.addPath(shapeId, Resources.getColor(routeId), Resources.getShapeLocations(shapeId))
                        
            // If the user hovers over the line, change the width
            route.getPaths().get(shapeId)?.getLine().addListener("mouseover", () => setBolded(route.getId(), true));
            
            // If the user stops hovering over the line, return back
            route.getPaths().get(shapeId)?.getLine().addListener("mouseout", () => setBolded(route.getId(), false));      
        })

        // Load Stops
        Resources.getTripIds(routeId).forEach(async tripId => {
            // Create the routes
            Resources.getStopIds(tripId).forEach(stopId => {
                // Creates the stop if it has not been created yet
                if (!route.getStops().has(stopId)) {
                    // Create stop
                    route.addStop(stopId, "#0022FF", Resources.getStopLocation(stopId));
                    
                    // If the user hovers over the stop, change the width of the line
                    route.getStops().get(stopId)?.getMarker().addListener("mouseover", () => {
                        setBolded(route.getId(), true)
                    });
                    
                    // If the user stops hovering over the stop, return back
                    route.getStops().get(stopId)?.getMarker().addListener("mouseout", () => {
                        setBolded(route.getId(), false)
                    }); 
                }
            })
        })
    }

    const routes = new Map<string, Route>();
    let map : google.maps.Map;
}

export default Routes;