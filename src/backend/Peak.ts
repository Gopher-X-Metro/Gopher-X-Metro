import L from "leaflet";
import { getCachedJSON } from "src/backend/Fetch.ts";

const PEAK_URL = "https://api.peaktransit.com/v5/index.php?app_id=_RIDER&key=c620b8fe5fdbd6107da8c8381f4345b4&action=list&agencyID=88&controller=";
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
    export async function getPeakShapeLocations(shapeId: string) : Promise<Array<L.LatLng>> {
        const shape = await getPeakShapes(shapeId);
        const shapeLocations: Array<L.LatLng> = [];

        const pointString = shape?.points ?? "";
        const pointArray = pointString.split(';');

        // console.log("Points array: ", pointArray);
        pointArray.forEach(point => {
            const [latStr, lngStr] = point.split(',');

            if (latStr && lngStr)
                shapeLocations.push(L.latLng(latStr, lngStr));
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
        const routes = await getCachedJSON(PEAK_URL + "route2", 60 * 60 * 1000);
        const route = routes?.routes?.find((r: any) => String(r.routeID) === String(routeId));
        return route ? [route] : [];
    }
    /**
     * Gets the shape data of a shapeId
     * @param shapeId ID of the shape
     */
    export async function getPeakShapes(shapeId: string) : Promise<any> {
        // One shared download of every campus shape, reused for an hour
        const data = await getCachedJSON(PEAK_URL + "shape2", 60 * 60 * 1000);
        return data?.shape?.find((shape: any) => String(shape.shapeID) === String(shapeId));
    }
/* University Routes and ID */
    export const UNIVERSITY_ROUTES = {
        "120": 11324, 
        "121": 11278, 
        "122": 11279, 
        "123": 11280, 
        "124": 11281,
        "125": 12527,
        "126": 12958
    };

    /* Night and weekend versions of routes, shown under the same route */
    export const NIGHT_ROUTES = {
        "121": 12591,
        "122": 12819
    };
}

export default Peak;