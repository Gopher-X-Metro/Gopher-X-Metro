namespace Peak {
    /**
     * Gets the running routes
     * @returns list of routes data
     */
    export async function getPeakShapeIds(routeId: string) : Promise<Set<string>> {
        return new Set((await (await getPeakTrips(routeId)))
        .map((trip: { shapeID: any; }) => trip.shapeID));
    }
    /**
     * Gets the location of each point on a shape line as an Array
     * @param shapeId ID of the shape
     */
    export async function getPeakShapeLocations(shapeId: string) : Promise<Array<google.maps.LatLng>> {
        const shape = await getPeakShapes(shapeId);
        const shapeLocations: Array<google.maps.LatLng> = [];

        const pointString = shape.points;
        const pointArray = pointString.split(';');

        // console.log("Points array: ", pointArray);
        pointArray.forEach(point => {
            const [latStr, lngStr] = point.split(',');

            if (latStr && lngStr)
                shapeLocations.push(new google.maps.LatLng(latStr, lngStr));
            else
                console.warn(`Invalid latitude/longitude pair: ${latStr}, ${lngStr}`);
        })
        

        return shapeLocations;
    }
    /**
     * Gets the trips of a route
     * @param routeId ID of the route
     */
    export async function getPeakTrips(routeId: string) : Promise<any> {
        if (!trips.has(routeId))
            // Load Trips
            await fetch("https://api.peaktransit.com/v5/index.php?app_id=_RIDER&key=c620b8fe5fdbd6107da8c8381f4345b4&controller=route2&action=list&agencyID=88")
            .then(async response => response.json()
            .then(data => data.routes?.forEach(route => trips.set(route.routeID, route))));

        return new Array(trips.get(routeId));
    }
    /**
     * Gets the shape data of a shapeId
     * @param shapeId ID of the shape
     */
    export async function getPeakShapes(shapeId: string) : Promise<any> {
        if (!shapes.has(shapeId))
            await fetch("https://api.peaktransit.com/v5/index.php?app_id=_RIDER&key=c620b8fe5fdbd6107da8c8381f4345b4&controller=shape2&action=list&agencyID=88")
            .then(async response => response.json()
            .then(data => data.shape?.forEach(shape => shapes.set(shape.shapeID, shape))))

        return shapes.get(shapeId); 
    }
    /**
     * Gets all vehicles that peak is tracking.
     */
    export async function getPeekVehicles() : Promise<Array<any>> {
        return await fetch("https://api.peaktransit.com/v5/index.php?app_id=_RIDER&key=c620b8fe5fdbd6107da8c8381f4345b4&controller=vehicle&action=list&agencyID=88")
                     .then(response => response.json()
                     .then(json => json.vehicles));
    }
    /**
     * Gets all stop etas for each stop and route
     */
    export async function getPeekStopETAs() : Promise<Array<any>> {
        return await fetch("https://api.peaktransit.com/v5/index.php?app_id=_RIDER&key=c620b8fe5fdbd6107da8c8381f4345b4&controller=eta&action=list&agencyID=88")
                    .then(response => response.json()
                    .then(json => json.stop));
    }
    /**
     * Tells if the route is a university route
     * @param routeId   route ID to check
     */
    export function isUniversityRoute(routeId: string) : boolean { 
        return (UNIVERSITY_ROUTES[routeId] !== undefined)
    }

    const shapes : Map<string, any> = new Map<string, any>();
    const trips : Map<string, any> = new Map<string, any>();    

    /* University Routes and ID */
    export const UNIVERSITY_ROUTES = {
        "120": 11324, 
        "121": 11278, 
        "122": 11279, 
        "123": 11280, 
        "124": 11281,
        "125": 12527
    };
}

export default Peak;