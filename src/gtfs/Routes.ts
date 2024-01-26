import Data from './Data.ts';
import Route from './Route.ts'

namespace Routes {
    function getQuerySelectorTextContext() {
        const query = document.querySelector("title");

        if (query && query.textContent) {
            return query.textContent
        } else {
            console.warn("Could not get document.querySelector(\"title\").textContext!")
            return ""
        }
    }

    // The resources that are loaded when starting the website
    export namespace Resouces {
        export const tripsFileHash = new Map<string, [Set<string>, Set<string>]>();
        export const shapesFileHash = new Map<string, Set<google.maps.LatLng>>();
        export const routesFileHash = new Map<string, string>();
        export const stopTimesFileHash = new Map<string, Set<string>>();
        export const stopsFileHash = new Map<string, google.maps.LatLng>();

        
        // localStorage.setItem("")

        export async function load() {
            console.log("Loading Resources...")

            await Data.getFiles().then(async files => {
                await files["trips.txt"].async("string").then(contents => {
                    contents.split("\r\n").forEach(line => {
                        const splitLine = line.split(",");
                        if (!tripsFileHash.has(splitLine[0])) { tripsFileHash.set(splitLine[0], [new Set(), new Set()]) }
                        tripsFileHash.get(splitLine[0])?.[0].add(splitLine[2]) // Trip ID for Stops
                        tripsFileHash.get(splitLine[0])?.[1].add(splitLine[7]) // Shape ID for Paths
                    })
                })
                
                await files["shapes.txt"].async("string").then(contents => {
                    contents.split("\r\n").forEach(line => {
                        const splitLine = line.split(",");
                        if (!shapesFileHash.has(splitLine[0])) { shapesFileHash.set(splitLine[0], new Set()) }
                        shapesFileHash.get(splitLine[0])?.add(new google.maps.LatLng(Number(splitLine[1]), Number(splitLine[2])))
                    })
                })
    
                await files["routes.txt"].async("string").then(contents => {
                    contents.split("\r\n").forEach(line => {
                        const splitLine = line.split(",");
    
                        if (!routesFileHash.has(splitLine[0])) { routesFileHash.set(splitLine[0], splitLine[7]) }
                    })
                })

                // await files["stop_times.txt"].async("string").then(contents => {
                //     contents.split("\r\n").forEach(line => {
                //         const splitLine = line.split(",");
    
                //         if (!stopTimesFileHash.has(splitLine[0])) { stopTimesFileHash.set(splitLine[0], new Set()) }

                //         stopTimesFileHash.get(splitLine[0])?.add(splitLine[3]);
                //     })
                // })

                // await files["stops.txt"].async("string").then(contents => {
                //     contents.split("\r\n").forEach(line => {
                //         const splitLine = line.split(",");
    
                //         if (!stopsFileHash.has(splitLine[0])) { stopsFileHash.set(splitLine[0], new google.maps.LatLng(Number(splitLine[4]), Number(splitLine[5]))) }
                //     })
                // })
            })
            
            console.log("Finished Loading Resources")
        }
    }

    // University Routes
    export const UNIVERSITY_ROUTES = {
        "120": 11324, 
        "121": 11278, 
        "122": 11279, 
        "123": 11280, 
        "124": 11281
    }

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

    let map: google.maps.Map;
    let routes: Map<string, Route> = new Map();

    // Gets a route from the hashmap
    export function getRoute(id: string) { return routes.get(id) }

    // Sets the map for the paths
    export function setMap(_map: google.maps.Map) { map = _map }

    // Gets routes from url
    export function getURLRoutes() {
        const routes = (new URLSearchParams(window.location.search)).get("route")?.split(",")

        if (routes) { delete routes[routes?.indexOf("")] }

        return (routes === undefined) ? [] : routes
    }

    // Adds a new route to the UR, Sets the route without reloading the website
    export function addURLRoute(id: string) {
            window.history.replaceState({}, getQuerySelectorTextContext(), "./?route=" + getURLRoutes().join(",") + ("," + id))
    }

    // Removes the specified route from the URL
    export function removeURLRoute(id: string) {
        let routes = getURLRoutes();
        if (routes.indexOf(id) !== -1) {
            routes.splice(routes.indexOf(id), 1);
            window.history.replaceState({}, getQuerySelectorTextContext(), "./?route=" + routes.join(","))
        }
    }

    // Loads a route into the routes list
    async function loadRoute(id: string) {
        const route = new Route(id);
        routes.set(id, route);

        Resouces.tripsFileHash.get(id)?.[1].forEach(shapeID => {
            let color = ROUTE_COLORS[id];
            let shape = Resouces.shapesFileHash.get(shapeID);

            if (shape === undefined) {shape = new Set()};
            if (color === "" || color === undefined) {color = "FF0000";}
            route.paths.addPath(shapeID, id, "", color, Array.from(shape), map)
        })

        Resouces.tripsFileHash.get(id)?.[0].forEach(tripID => {
            Resouces.stopTimesFileHash.get(tripID)?.forEach(stopID => {
                let location = Resouces.stopsFileHash.get(stopID)

                if (location === undefined) { location = new google.maps.LatLng(0, 0) }

                route.stops.addStop(stopID, id, "#0022FF", location, map)
            })
        })

        console.log(route)
    }

    export function refresh() {
        routes.forEach(route => {
            if (getURLRoutes().indexOf(route.id) === -1) {
                route.setVisible(false)
            }
        })
        
        getURLRoutes().forEach(route => {
            if (!routes.has(route)) { loadRoute(route); }
            routes.get(route)?.setVisible(true);
        })
    }
}


export default Routes;