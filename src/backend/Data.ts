/**
 * @file This file defines a data service class for retrieving and processing transit data,
 * abstracting the underlying network requests.
 * @reference ./Network.ts
 */

import Network, { IMetroShape, IMetroTrip, IPeakShape, IPeakRoute, IMetroRoute } from "src/backend/Network";

/**
 * @interface IPoint
 * @description Represents a geographical point with latitude, longitude, and sequence.
 */
interface IPoint {
    lat: number,
    lng: number,
    sequence: number
}

/**
 * @interface IPath
 * @description Represents a transit route path, containing the route ID, shape ID, and an array of geographical points.
 */
interface IPath {
    routeId: string;
    shapeId: string;
    points: Array<IPoint>;
}

/**
 * @class Data
 * @description A singleton class responsible for providing processed transit data,
 * abstracting the direct network requests made by the {@link Network} class.
 */
export default class Data {
    static #instance: Data;
    
    /**
     * @private
     * @readonly
     * @property {#UNIVERSITY_ROUTES: Record<string, number>} - A mapping of specific route IDs to their corresponding university-specific IDs.
     */
    static readonly #UNIVERSITY_ROUTES = {
        "120": 11324,
        "121": 11278,
        "122": 11279,
        "123": 11280,
        "124": 11281,
        "125": 12527,
        "FOOTBALL": 12604
    };

    private constructor() {}

    /**
     * @returns {Data} The singleton instance of the Data class.
     * @description Returns the single instance of the Data class, creating it if it doesn't exist.
     */
    public static get instance(): Data {
        if (!Data.#instance) {
            Data.#instance = new Data();
        }

        return Data.#instance;
    }

    /**
     * @param {string} routeId - The ID of the route to fetch paths for.
     * @returns {Promise<Array<IPath> | undefined>} A promise that resolves to an array of route paths, or undefined if an error occurs.
     * @description Retrieves processed paths (route ID, shape ID, and points) for a given route ID.
     */
    public async getPaths(routeId: string) : Promise<Array<IPath> | undefined> {
        return PathsDataRetriever.instance.retrieve(routeId);
    }

    public async getColor(routeId: string) : Promise<string> {
        return ColorDataRetriever.instance.retrieve(routeId);
    }

    /**
     * @param {string} routeId - The string ID of the route to look up.
     * @returns {number | undefined} The numerical university-specific route ID if found, otherwise undefined.
     * @description Returns the university-specific route ID if the provided route ID is in the mapping.
     */
    public getUniversityRouteId(routeId: string) : number | undefined {
        return Data.#UNIVERSITY_ROUTES[routeId];
    }
    
    /**
     * @param {Array<IPoint>} path - An array of IPoint objects representing a path.
     * @returns {Array<google.maps.LatLng>} An array of google.maps.LatLng objects representing the same path, sorted by sequence.
     * @description Converts an array of IPoint objects to an array of google.maps.LatLng objects, ensuring the points are sorted by their sequence.
     */
    public pathPointsToGoogleLatLng(path: Array<IPoint>) : Array<google.maps.LatLng>  {
        return path.sort((pointA, pointB) => pointA.sequence - pointB.sequence).map(point => new google.maps.LatLng(point.lat, point.lng));
    }
}

/**
 * @abstract
 * @class DataRetriever
 * @description An abstract base class for data retrievers, defining the basic structure for fetching processed data.
 */
abstract class DataRetriever {
    abstract retrieve(...args: string[]) : any | undefined;
}

/**
 * @class TripsDataRetriever
 * @extends DataRetriever
 * @description A concrete class responsible for retrieving trip data, handling the logic for fetching from the appropriate source (Metro or Peak). Implements the singleton pattern.
 */
class TripsDataRetriever extends DataRetriever {
    static #instance: TripsDataRetriever;

    private constructor() { super(); }

    /**
     * @returns {TripsDataRetriever} The singleton instance of the TripsDataRetriever class.
     * @description Returns the single instance of the `TripsDataRetriever` class, creating it if it doesn't exist.
     */
    public static get instance(): TripsDataRetriever {
        if (!TripsDataRetriever.#instance) {
            TripsDataRetriever.#instance = new TripsDataRetriever();
        }

        return TripsDataRetriever.#instance;
    }

    /**
     * @param {string} routeId - The ID of the route to fetch trips for.
     * @returns {Promise<Array<IMetroTrip | IPeakTrip> | undefined>} A promise that resolves to an array of metro or peak trips, or undefined if an error occurs.
     * @description Retrieves trip data for a given route ID. It first checks if it's a university route and fetches from the Peak API if so, otherwise it fetches from the Metro API.
     */
    async retrieve(routeId : string): Promise<Array<IMetroTrip | IPeakRoute> | undefined> {
        const id = Data.instance.getUniversityRouteId(routeId);

        if (!id) {
            return await Network.instance.getMetroTrips(routeId);
        }

        return await Network.instance.getPeakRoutes(id?.toString());
    }
}

/**
 * @class ShapesDataRetriever
 * @extends DataRetriever
 * @description A concrete class responsible for retrieving shape data, handling the logic for fetching from the appropriate source (Metro or Peak). Implements the singleton pattern.
 */
class ShapesDataRetriever extends DataRetriever {
    static #instance: ShapesDataRetriever;

    private constructor() { super(); }

    /**
     * @returns {ShapesDataRetriever} The singleton instance of the ShapesDataRetriever class.
     * @description Returns the single instance of the `ShapesDataRetriever` class, creating it if it doesn't exist.
     */
    public static get instance(): ShapesDataRetriever {
        if (!ShapesDataRetriever.#instance) {
            ShapesDataRetriever.#instance = new ShapesDataRetriever();
        }

        return ShapesDataRetriever.#instance;
    }

    /**
     * @param {string} shapeId - The ID of the shape to fetch.
     * @returns {Promise<Array<IMetroShape | IPeakShape> | undefined>} A promise that resolves to an array of metro or peak shape points, or undefined if an error occurs.
     * @description Retrieves shape data for a given shape ID. It first tries to fetch from the Metro API and falls back to the Peak API if no data is found.
     */
    async retrieve(shapeId : string): Promise<Array<IMetroShape | IPeakShape> | undefined> {
        const data = await Network.instance.getMetroShapes(shapeId);

        if (data && data.length > 0) {
            return data
        }

        return await Network.instance.getPeakShapes(shapeId);
    }
}

/**
 * @class PathsDataRetriever
 * @extends DataRetriever
 * @description A concrete class responsible for retrieving and processing path data. It fetches trips and shapes, then combines them into a structured path format. Implements the singleton pattern.
 */
class PathsDataRetriever extends DataRetriever {
    static #instance: PathsDataRetriever;

    private constructor() { super(); }

    /**
     * @returns {PathsDataRetriever} The singleton instance of the PathsDataRetriever class.
     * @description Returns the single instance of the `PathsDataRetriever` class, creating it if it doesn't exist.
     */
    public static get instance(): PathsDataRetriever {
        if (!PathsDataRetriever.#instance) {
            PathsDataRetriever.#instance = new PathsDataRetriever();
        }

        return PathsDataRetriever.#instance;
    }

    /**
     * @param {string} routeId - The ID of the route to fetch paths for.
     * @returns {Promise<Array<IPath> | undefined>} A promise that resolves to an array of route paths, or undefined if an error occurs.
     * @description Retrieves and processes path data for a given route ID. It fetches trips and their corresponding shapes, then structures the data into an array of `IPath` objects.
     */
    async retrieve(routeId : string): Promise<Array<IPath> | undefined> {
        // Check if the route ID corresponds to a university-specific route.
        // University routes are handled differently as they use the Peak Transit API and have specific IDs.
        const university = Data.instance.getUniversityRouteId(routeId) !== undefined;

        const trips = await TripsDataRetriever.instance.retrieve(routeId);

        if (!trips) { return undefined; }

        // Initialize a Map to store the paths. The key is the shape ID, which ensures that we only process each unique shape once, even if multiple trips use the same shape.
        const paths : Map<number, IPath> = new Map<number, IPath>();

        for (const trip of trips) {
            // Determine the shape ID. For university routes (Peak), it's directly available as `shapeID`. For regular routes (Metro), it's `shape_id`.
            const shapeId = university ? (trip as IPeakRoute).shapeID : (trip as IMetroTrip).shape_id;

            // If we have already processed a path with this shape ID, we can skip it. This prevents duplicate path entries if multiple trips follow the same shape.
            if (paths.has(shapeId)) {
                continue;
            }

            const shapes = await ShapesDataRetriever.instance.retrieve(shapeId.toString());

            if (!shapes) { return undefined; }

            // Initialize a Set to store the geographical points of the shape. A Set is used to automatically handle potential duplicate points.
            let points = new Set<IPoint>();
            for (const shape of shapes) {
                // University (Peak) and regular (Metro) routes have different structures for their shape data.
                if (university) {
                    // For Peak Transit, the 'points' property is a string where each point (latitude and longitude) is separated by a comma, and points are separated by semicolons.
                    (shape as IPeakShape).points.split(";").forEach((point, index) => {
                        const split = point.split(",");
                        // Ensure we have both latitude and longitude.
                        if (split.length === 2) {
                            points.add({lat: Number(split[0]), lng: Number(split[1]), sequence: index});
                        }
                    })
                } else {
                    // For Metro Transit, each shape point is an object with separate properties for latitude, longitude, and sequence.
                    const point = shape as IMetroShape;
                    points.add({lat: point.shape_pt_lat, lng: point.shape_pt_lon, sequence: point.shape_pt_sequence});
                }
            }

            paths.set(shapeId, {routeId: routeId, shapeId: shapeId.toString(), points: Array.from(points)});
        }

        return Array.from(paths.values());
    }
}

class RoutesDataRetriever extends DataRetriever {
    static #instance: RoutesDataRetriever;

    private constructor() { super(); }

    /**
     * @returns {RoutesDataRetriever} The singleton instance of the TripsDataRetriever class.
     * @description Returns the single instance of the `TripsDataRetriever` class, creating it if it doesn't exist.
     */
    public static get instance(): RoutesDataRetriever {
        if (!RoutesDataRetriever.#instance) {
            RoutesDataRetriever.#instance = new RoutesDataRetriever();
        }

        return RoutesDataRetriever.#instance;
    }

    /**
     * @param {string} routeId - The ID of the route to fetch trips for.
     * @returns {Promise<Array<IMetroTrip | IPeakTrip> | undefined>} A promise that resolves to an array of metro or peak trips, or undefined if an error occurs.
     * @description Retrieves trip data for a given route ID. It first checks if it's a university route and fetches from the Peak API if so, otherwise it fetches from the Metro API.
     */
    async retrieve(routeId : string): Promise<Array<IMetroRoute | IPeakRoute> | undefined> {
        const id = Data.instance.getUniversityRouteId(routeId);

        if (!id) {
            return await Network.instance.getMetroRoute(routeId);
        }

        return await Network.instance.getPeakRoutes(id?.toString());
    }
}

class ColorDataRetriever extends DataRetriever {
    static #instance: ColorDataRetriever;

    /* Override Route Colors */
    static #ROUTE_COLORS = {
        "120": "FFC0CB", 
        "121": "FF0000", 
        "122": "800080", 
        "123": "1ab7b7", 
        "124": "90EE90",
        "125": "c727e2",
        "FOOTBALL": "964B00",
        "2": "bab832",
        "3": "d18528",
        "6": "236918",
        "902": "00843D",
        "901": "003DA5"
    };

    private constructor() { super(); }

    public static get instance(): ColorDataRetriever {
        if (!ColorDataRetriever.#instance) {
            ColorDataRetriever.#instance = new ColorDataRetriever();
        }

        return ColorDataRetriever.#instance;
    }

    async retrieve(routeId : string): Promise<string> {
        let color = ColorDataRetriever.#ROUTE_COLORS[routeId];

        if (color) { return color; }

        const university = Data.instance.getUniversityRouteId(routeId) !== undefined;
        const route = await RoutesDataRetriever.instance.retrieve(routeId);

        if ((route) && (route.length > 0)) {
            color = university ? (route[0] as IPeakRoute).color : (route[0] as IMetroRoute).route_color;
        }

        if (color) { return color }

        return "#222222" //TODO: Figure out what to do as a default route color
    }
}