namespace Peak {
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

    /**
     * Gets the running routes
     * @param routeId ID of route
     * @returns list of routes data
     */
    export async function getPeakShapeIds(routeId: string) : Promise<Set<string>> {
        return new Set((await (await getPeakTrips(routeId)))
        .map((trip: { shapeID: any; }) => trip.shapeID));
    }

    /**
     * Gets the location of each point on a shape line as an Array
     * @param shapeId ID of the shape
     * @returns location/coordinates of route data
     */
    export async function getPeakShapeLocations(shapeId: string) : Promise<Array<google.maps.LatLng>> {
        const shape = await getPeakShapes(shapeId);
        const shapeLocations: Array<google.maps.LatLng> = [];

        const pointString = shape.points;
        const pointArray = pointString.split(';');

        pointArray.forEach(point => {
            const [latStr, lngStr] = point.split(',');

            if (latStr && lngStr)
                shapeLocations.push(new google.maps.LatLng(latStr, lngStr));
        })

        return shapeLocations;
    }

    /* Private Helper Methods */
    
    /**
     * Gets the trips of a route
     * @param routeId ID of the route
     * @returns array of trips
     */
    async function getPeakTrips(routeId: string) : Promise<any> {
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
     * @returns shape data
     */
    async function getPeakShapes(shapeId: string) : Promise<any> {
        if (!shapes.has(shapeId))
            await fetch("https://api.peaktransit.com/v5/index.php?app_id=_RIDER&key=c620b8fe5fdbd6107da8c8381f4345b4&controller=shape2&action=list&agencyID=88")
            .then(async response => response.json()
            .then(data => data.shape?.forEach(shape => shapes.set(shape.shapeID, shape))))

        return shapes.get(shapeId); 
    }
}

export default Peak;