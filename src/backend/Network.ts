/**
 * @file This file defines interfaces and classes for fetching transit data from different APIs (Metro Transit and Peak Transit).
 * @reference src/backend/Static.ts
 * @reference src/backend/Realtime.ts
 * @reference src/backend/interface/StopInterface.ts
 * @reference src/backend/interface/TripInterface.ts
 * @reference src/backend/interface/ShapeInterface.ts
 */

/**
 * @interface IMetroTrip
 * @description Represents the data structure for a single metro transit trip.
 */
export interface IMetroTrip {
    route_id: number;
    trip_id: string;
    shape_id: number;
    service_id: string;
    direction_id: number;
}

/**
 * @interface IMetroShape
 * @description Represents a geographical point that defines the shape (path) of a metro transit route.
 */
export interface IMetroShape {
    shape_id: number;
    shape_pt_lat: number;
    shape_pt_lon: number;
    shape_dist_traveled: number;
    shape_pt_sequence: number;
}

/**
 * @interface IMetroCalendar
 * @description Represents the service schedule for a specific service ID in the metro transit system.
 */
export interface IMetroCalendar {
    service_id: number;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
    start_date: number;
    end_date: number;
}

/**
 * @interface IPeakTrip
 * @description Represents the data structure for a single Peak transit trip.
 */
export interface IPeakTrip {
    routeID: number;
    agencyID: number;
    shortName: string;
    longName: string;
    routeType: number;
    sequence: number;
    description: string;
    color: string;
    textColor: string;
    onDemand: boolean;
    calcETA: boolean;
    hidden: boolean;
    updated: number;
    disabled: boolean;
    scheduleURL: string;
    scheduleURLType: string;
    shapeID: number;
    schedAdh: boolean;
    aliases: string;
    source: null;
    LastETACalc: number;
    routeCode: string;
    special_service: boolean;
}

/**
 * @interface IPeakShape
 * @description Represents the geographical shape (path) of a Peak transit route.
 */
export interface IPeakShape {
    shapeID: number;
    agencyID: number;
    shapeName: string;
    routeID: number;
    description: string;
    points: string;
    source: string;
    updated: number;
    disabled: boolean;
    directions: string;
    dynamicTotalShapeTime: number;
}

/**
 * @interface IPeakTripResponse
 * @description Represents the response structure when fetching Peak transit trips.
 */
export interface IPeakTripResponse {
    routes: Array<IPeakTrip>;
    success: boolean;
}

/**
 * @interface IPeakShapeResponse
 * @description Represents the response structure when fetching Peak transit shapes.
 */
export interface IPeakShapeResponse {
    shape: Array<IPeakShape>;
    success: boolean;
}

/**
 * @class Network
 * @description A singleton class responsible for fetching transit data from various APIs (Metro and Peak).
 */
export default class Network {
    static #instance: Network;

    private constructor() {}

    /**
     * @returns {Network} The singleton instance of the Network class.
     * @description Returns the single instance of the Network class, creating it if it doesn't exist.
     */
    public static get instance(): Network {
        if (!Network.#instance) {
            Network.#instance = new Network();
        }

        return Network.#instance;
    }

    /**
     * @param {string} routeId - The ID of the metro route to fetch trips for.
     * @returns {Promise<Array<IMetroTrip> | undefined>} A promise that resolves to an array of metro trips or undefined if an error occurs.
     * @description Fetches metro trips for a given route ID.
     */
    public async getMetroTrips(routeId : string) : Promise<Array<IMetroTrip> | undefined> {
        return TripsMetroNetworkRetriever.instance.retrieve(routeId);
    }

    /**
     * @param {string} shapeId - The ID of the metro shape to fetch.
     * @returns {Promise<Array<IMetroShape> | undefined>} A promise that resolves to an array of metro shape points or undefined if an error occurs.
     * @description Fetches metro shape points for a given shape ID.
     */
    public async getMetroShapes(shapeId : string) : Promise<Array<IMetroShape> | undefined> {
        return ShapesMetroNetworkRetriever.instance.retrieve(shapeId);
    }

    /**
     * @param {string} serviceId - The ID of the metro service calendar to fetch.
     * @returns {Promise<IMetroCalendar | undefined>} A promise that resolves to a metro calendar object or undefined if an error occurs.
     * @description Fetches the metro calendar for a given service ID.
     */
    public async getMetroCalendar(serviceId : string) : Promise<IMetroCalendar | undefined> {
        return CalendarMetroNetworkRetriever.instance.retrieve(serviceId);
    }


    /**
     * @param {string} routeId - The ID of the Peak route to fetch trips for.
     * @returns {Promise<Array<IPeakTrip> | undefined>} A promise that resolves to an array of Peak trips or undefined if an error occurs.
     * @description Fetches Peak trips for a given route ID.
     */
    public async getPeakTrips(routeId : string) : Promise<Array<IPeakTrip> | undefined> {
        return TripsPeakNetworkRetriever.instance.retrieve(routeId);
    }

    /**
     * @param {string} shapeId - The ID of the Peak shape to fetch.
     * @returns {Promise<Array<IPeakShape> | undefined>} A promise that resolves to an array of Peak shape points or undefined if an error occurs.
     * @description Fetches Peak shape points for a given shape ID.
     */
    public async getPeakShapes(shapeId : string) : Promise<Array<IPeakShape> | undefined> {
        return ShapesPeakNetworkRetriever.instance.retrieve(shapeId);
    }

    /**
     * @param {string} stopId - The ID of the Peak stop to fetch information for.
     * @returns {Promise<Array<any> | undefined>} A promise that resolves to an array of Peak stop information or undefined if an error occurs.
     * @description Fetches Peak stop information for a given stop ID.
     */
    public async getPeakStops(stopId : string) : Promise<Array<any> | undefined> {
        return StopsPeakNetworkRetriever.instance.retrieve(stopId);
    }


    /**
     * @param {string} routeId - The ID of the route to fetch next trip stops for.
     * @param {string} directionId - The ID of the direction for the route.
     * @returns {Promise<any | undefined>} A promise that resolves to information about the next trip stops or undefined if an error occurs.
     * @description Fetches the stops for the next trip of a given route and direction.
     */
    public async getNextTripStops(routeId : string, directionId : string) : Promise<any | undefined> {
        return StopsNextTripNetworkRetriever.instance.retrieve(routeId, directionId);
    }
}

/**
 * @abstract
 * @class NetworkRetriever
 * @description An abstract base class for network retrievers, defining the basic structure for fetching data from an API.
 */
abstract class NetworkRetriever {
    protected readonly API_URL : string;

    constructor(API_URL : string) { this.API_URL = API_URL; }

    abstract retrieve(...args : string[]) : any | undefined;
}

/**
 * @abstract
 * @class MetroNetworkRetriever
 * @extends NetworkRetriever
 * @description An abstract class for network retrievers specifically for the Metro Transit API.
 */
abstract class MetroNetworkRetriever extends NetworkRetriever {
    constructor() { super(process.env.REACT_APP_SUPABASE_FUNCTION_URL_2 as string); }
}

/**
 * @abstract
 * @class NextTripNetworkRetriever
 * @extends NetworkRetriever
 * @description An abstract class for network retrievers specifically for the Metro Transit Nextrip API.
 */
abstract class NextTripNetworkRetriever extends NetworkRetriever {
    constructor() { super("https://svc.metrotransit.org/nextrip"); }
}

/**
 * @abstract
 * @class PeakNetworkRetriever
 * @extends NetworkRetriever
 * @description An abstract class for network retrievers specifically for the Peak Transit API.
 */
abstract class PeakNetworkRetriever extends NetworkRetriever {
    protected readonly API_URL_END : string = "&action=list&agencyID=88";
    constructor() { super("https://api.peaktransit.com/v5/index.php?app_id=_RIDER&key=c620b8fe5fdbd6107da8c8381f4345b4&controller="); }
}

/**
 * @class TripsMetroNetworkRetriever
 * @extends MetroNetworkRetriever
 * @description A concrete class responsible for fetching metro trip data. Implements the singleton pattern.
 */
class TripsMetroNetworkRetriever extends MetroNetworkRetriever {
    static #instance: TripsMetroNetworkRetriever;

    private constructor() {super();}

    /**
     * @returns {TripsMetroNetworkRetriever} The singleton instance of the TripsMetroNetworkRetriever class.
     * @description Returns the single instance of the `TripsMetroNetworkRetriever` class, creating it if it doesn't exist.
     */
    public static get instance(): TripsMetroNetworkRetriever {
        if (!TripsMetroNetworkRetriever.#instance) {
            TripsMetroNetworkRetriever.#instance = new TripsMetroNetworkRetriever();
        }

        return TripsMetroNetworkRetriever.#instance;
    }

    async retrieve(routeId : string): Promise<Array<IMetroTrip> | undefined> {
        return fetch(`${this.API_URL}/api/get-trips?route_id=${routeId}`)
        .then((response : Response) =>
            response.ok ?
            response.json().then((json : Array<IMetroTrip>) => json)
            : undefined
        );
    }
}

/**
 * @class ShapesMetroNetworkRetriever
 * @extends MetroNetworkRetriever
 * @description A concrete class responsible for fetching metro shape data. Implements the singleton pattern.
 */
class ShapesMetroNetworkRetriever extends MetroNetworkRetriever {
    static #instance: ShapesMetroNetworkRetriever;

    private constructor() {super();}

    /**
     * @returns {ShapesMetroNetworkRetriever} The singleton instance of the ShapesMetroNetworkRetriever class.
     * @description Returns the single instance of the `ShapesMetroNetworkRetriever` class, creating it if it doesn't exist.
     */
    public static get instance(): ShapesMetroNetworkRetriever {
        if (!ShapesMetroNetworkRetriever.#instance) {
            ShapesMetroNetworkRetriever.#instance = new this();
        }

        return ShapesMetroNetworkRetriever.#instance;
    }

    async retrieve(routeId : string): Promise<Array<IMetroShape> | undefined> {
        return fetch(`${this.API_URL}/api/get-shapes?shape_id=${routeId}`)
        .then((response : Response) =>
            response.ok ?
            response.json().then((json : Array<IMetroShape>) => json)
            : undefined
        );
    }
}

/**
 * @class CalendarMetroNetworkRetriever
 * @extends MetroNetworkRetriever
 * @description A concrete class responsible for fetching metro calendar data. Implements the singleton pattern.
 */
class CalendarMetroNetworkRetriever extends MetroNetworkRetriever {
    static #instance: CalendarMetroNetworkRetriever;

    private constructor() {super();}

    /**
     * @returns {CalendarMetroNetworkRetriever} The singleton instance of the CalendarMetroNetworkRetriever class.
     * @description Returns the single instance of the `CalendarMetroNetworkRetriever` class, creating it if it doesn't exist.
     */
    public static get instance(): CalendarMetroNetworkRetriever {
        if (!CalendarMetroNetworkRetriever.#instance) {
            CalendarMetroNetworkRetriever.#instance = new CalendarMetroNetworkRetriever();
        }

        return CalendarMetroNetworkRetriever.#instance;
    }

    async retrieve(serviceId : string): Promise<IMetroCalendar | undefined> {
        return fetch(`${this.API_URL}/api/get-calendar?service_id=${serviceId}`)
        .then((response : Response) =>
            response.ok ?
            response.json().then((json : IMetroCalendar) => json)
            : undefined
        );
    }
}

/**
 * @class TripsPeakNetworkRetriever
 * @extends PeakNetworkRetriever
 * @description A concrete class responsible for fetching Peak transit trip data. Implements the singleton pattern and caches the fetched trips.
 */
class TripsPeakNetworkRetriever extends PeakNetworkRetriever {
    static #instance: TripsPeakNetworkRetriever;
    static #trips: Array<IPeakTrip> | undefined;

    private constructor() {super();}

    /**
     * @returns {TripsPeakNetworkRetriever} The singleton instance of the TripsPeakNetworkRetriever class.
     * @description Returns the single instance of the `TripsPeakNetworkRetriever` class, creating it if it doesn't exist.
     */
    public static get instance(): TripsPeakNetworkRetriever {
        if (!TripsPeakNetworkRetriever.#instance) {
            TripsPeakNetworkRetriever.#instance = new TripsPeakNetworkRetriever();
        }

        return TripsPeakNetworkRetriever.#instance;
    }

    async retrieve(routeId : string): Promise<Array<IPeakTrip> | undefined> {
        if (!TripsPeakNetworkRetriever.#trips) {
            TripsPeakNetworkRetriever.#trips = await fetch(`${this.API_URL}route2${this.API_URL_END}`)
            .then((response : Response) =>
                response.ok ?
                response.json().then((json : IPeakTripResponse) => json.routes)
                : undefined
            );
        }

        return TripsPeakNetworkRetriever.#trips?.filter((trip) => trip.routeID.toString() === routeId);
    }
}

/**
 * @class ShapesPeakNetworkRetriever
 * @extends PeakNetworkRetriever
 * @description A concrete class responsible for fetching Peak transit shape data. Implements the singleton pattern and caches the fetched shapes.
 */
class ShapesPeakNetworkRetriever extends PeakNetworkRetriever {
    static #instance: ShapesPeakNetworkRetriever;
    static #shapes: Array<IPeakShape> | undefined;

    private constructor() {super();}

    /**
     * @returns {ShapesPeakNetworkRetriever} The singleton instance of the ShapesPeakNetworkRetriever class.
     * @description Returns the single instance of the `ShapesPeakNetworkRetriever` class, creating it if it doesn't exist.
     */
    public static get instance(): ShapesPeakNetworkRetriever {
        if (!ShapesPeakNetworkRetriever.#instance) {
            ShapesPeakNetworkRetriever.#instance = new this();
        }

        return ShapesPeakNetworkRetriever.#instance;
    }

    async retrieve(shapeId : string): Promise<Array<IPeakShape> | undefined> {
        if (!ShapesPeakNetworkRetriever.#shapes) {
            ShapesPeakNetworkRetriever.#shapes = await fetch(`${this.API_URL}shape2${this.API_URL_END}`)
            .then((response : Response) =>
                response.ok ?
                response.json().then((json : IPeakShapeResponse) => json.shape)
                : undefined
            );
        }

        return ShapesPeakNetworkRetriever.#shapes?.filter((shape) => shape.shapeID.toString() === shapeId);
    }
}

/**
 * @class StopsPeakNetworkRetriever
 * @extends PeakNetworkRetriever
 * @description A concrete class responsible for fetching Peak transit stop data. Implements the singleton pattern and caches the fetched stops.
 */
class StopsPeakNetworkRetriever extends PeakNetworkRetriever {
    static #instance: StopsPeakNetworkRetriever;
    static #stops: Array<any> | undefined;

    private constructor() {super();}

    /**
     * @returns {StopsPeakNetworkRetriever} The singleton instance of the StopsPeakNetworkRetriever class.
     * @description Returns the single instance of the `StopsPeakNetworkRetriever` class, creating it if it doesn't exist.
     */
    public static get instance(): StopsPeakNetworkRetriever {
        if (!StopsPeakNetworkRetriever.#instance) {
            StopsPeakNetworkRetriever.#instance = new this();
        }

        return StopsPeakNetworkRetriever.#instance;
    }

    async retrieve(stopId : string): Promise<Array<any> | undefined> {
        if (!StopsPeakNetworkRetriever.#stops) {
            StopsPeakNetworkRetriever.#stops = await fetch(`${this.API_URL}stop${this.API_URL_END}`)
            .then((response : Response) =>
                response.ok ?
                response.json().then((json : any) => json.stop)
                : undefined
            );
        }

        return StopsPeakNetworkRetriever.#stops?.filter((stop) => stop.stopID.toString() === stopId);
    }
}

/**
 * @class StopsNextTripNetworkRetriever
 * @extends NextTripNetworkRetriever
 * @description A concrete class responsible for fetching next trip stop data from the Metro Transit Nextrip API. Implements the singleton pattern.
 */
class StopsNextTripNetworkRetriever extends NextTripNetworkRetriever {
    static #instance: StopsNextTripNetworkRetriever;

    private constructor() {super();}

    /**
     * @returns {StopsNextTripNetworkRetriever} The singleton instance of the StopsNextTripNetworkRetriever class.
     * @description Returns the single instance of the `StopsNextTripNetworkRetriever` class, creating it if it doesn't exist.
     */
    public static get instance(): StopsNextTripNetworkRetriever {
        if (!StopsNextTripNetworkRetriever.#instance) {
            StopsNextTripNetworkRetriever.#instance = new this();
        }

        return StopsNextTripNetworkRetriever.#instance;
    }

    async retrieve(routeId : string, directionId : string): Promise<any | undefined> {
        return await fetch(`${this.API_URL}/stops/${routeId}/${directionId}`)
        .then((response : Response) =>
            response.ok ?
            response.json().then((json : any) => json)
            : undefined
        );
    }
}