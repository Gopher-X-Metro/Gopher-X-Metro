import Resources from "../backend/Resources.ts";
import URL from "../backend/URL.ts";
import Route from "./components/Route.ts";

namespace Routes {
    export const ROUTE_COLORS = {
        "120": "FFC0CB", 
        "121": "FF0000", 
        "122": "800080", 
        "123": "00FFFF", 
        "124": "90EE90",
        "2": "bab832",
        "3": "d18528",
        "6": "236918",
        "902": "00843D",
        "901": "003DA5"
    }


    // Sets the map for the routes
    export function setMap(_map : google.maps.Map) : void { map = _map; }

    // Gets a route from the hashmap
    export function getRoute(route : string) : Route | undefined { return routes.get(route); }

    // Sets a route's visibility
    export function setVisible(route : string, visible : boolean) {
        getRoute(route)?.getPaths()?.forEach(paths => paths.getLine().setVisible(visible));
        getRoute(route)?.getStops()?.forEach(stops => stops.getMarker().setVisible(visible));
        getRoute(route)?.getVehicles()?.forEach(vehicle => vehicle.getMarker().setVisible(visible));
    }

    // Sets a route's thickness
    export function setBolded(route : string, bolded : boolean) {
        getRoute(route)?.getPaths()?.forEach(paths => paths.getLine().set("strokeWeight", bolded ? process.env.REACT_APP_LINE_BOLD : process.env.REACT_APP_LINE_NORMAL));
    }


    // Refreshes the routes after the change of the url
    export function refresh() {
        routes.forEach(route => {
            if (URL.getRoutes().indexOf(route.getId()) === -1) {
                setVisible(route.getId(), false);
            }
        })
        
        URL.getRoutes().forEach(route => {
            if (!routes.has(route)){ 
                loadRoute(route);
            }
            setVisible(route, true)
        })
    }

    // Loads a route into the routes list
    async function loadRoute(id: string) {
        const route = new Route(id);
        routes.set(id, route);

        Resources.tripsFileHash.get(id)?.[1].forEach(shapeID => {
            let color = ROUTE_COLORS[id];
            let shape = Resources.shapesFileHash.get(shapeID);

            if (shape === undefined) {shape = new Set()};
            if (color === "" || color === undefined) {color = "FF0000";}

            route.addPath(shapeID, id, "", color, Array.from(shape), map)
            
            // If the user hovers over the line, change the width
            route.getPaths()?.get(shapeID)?.getLine().addListener("mouseover", () => setBolded(route.getId(), true));
            
            // If the user stops hovering over the line, return back
            route.getPaths()?.get(shapeID)?.getLine().addListener("mouseout", () => setBolded(route.getId(), false));
        })

        Resources.tripsFileHash.get(id)?.[0].forEach(tripID => {
            Resources.stopTimesFileHash.get(tripID)?.forEach(stopID => {
                let location = Resources.stopsFileHash.get(stopID)

                if (location === undefined) { location = new google.maps.LatLng(0, 0) }

                route.addStop(stopID, id, "#0022FF", location, map)
            })
        })
    }

    const routes = new Map<string, Route>();
    let map : google.maps.Map;
}

export default Routes;