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
        const shapeData = await (await getPeakShapes(shapeId));

        const shapeArray = shapeData.shape;
        const shapeLocations: Array<google.maps.LatLng> = [];

        shapeArray.forEach((shape: { points: string; }) => {
            const pointString = shape.points;
            const pointArray = pointString.split(';');

            console.log("Points array: ", pointArray);
            pointArray.forEach(point => {
                const [latStr, lngStr] = point.split(',');

                if (latStr && lngStr) {
                    const lat = Number(latStr.trim().replace('/', ''));
                    const lng = Number(lngStr.trim().replace('/', ''));
                    // console.log("Points: ", point);
                    // console.log("Lat and Longs", lat, lng);

                    shapeLocations.push(new google.maps.LatLng(lat, lng));
                } else {
                    console.warn(`Invalid latitude/longitude pair: ${latStr}, ${lngStr}`);
                }
            })
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
            .then(async response => trips.set(routeId, (await response.json()).routes));

        console.log("Trips: ", trips.get(routeId));

        return trips.get(routeId)
    }

    /**
     * Gets the shape data of a shapeId
     * @param shapeId ID of the shape
     */
    export async function getPeakShapes(shapeId: string) : Promise<any> {
        if (!shapes.has(shapeId))
            await fetch("https://api.peaktransit.com/v5/index.php?app_id=_RIDER&key=c620b8fe5fdbd6107da8c8381f4345b4&controller=shape2&action=list&agencyID=88")
            .then(async response => shapes.set(shapeId, await response.json()));
        
        console.log(shapes.get(shapeId));

        return shapes.get(shapeId); 
    }

    const shapes : Map<string, any> = new Map<string, any>();
    const trips : Map<string, any> = new Map<string, any>();    

    /* University Routes and ID */
    export const UNIVERSITY_ROUTES = {
        "120": 11324, 
        "121": 11278, 
        "122": 11279, 
        "123": 11280, 
        "124": 11281
    };
}

export default Peak;