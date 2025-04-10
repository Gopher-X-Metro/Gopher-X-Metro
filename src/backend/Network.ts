export interface IMetroTrip {
    route_id: number;
    trip_id: string;
    shape_id: number;
    service_id: string;
    direction_id: number;
}

export interface IMetroShape {
    shape_id: number;
    shape_pt_lat: number;
    shape_pt_lon: number;
    shape_dist_traveled: number;
    shape_pt_sequence: number;
}

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

export interface IPeakTripResponse {
    routes: Array<IPeakTrip>;
    success: boolean;
}

export interface IPeakShapeResponse {
    shape: Array<IPeakShape>;
    success: boolean;
}

export default class Network {
    static #instance: Network;
    
    private constructor() {}

    public static get instance(): Network {
        if (!Network.#instance) {
            Network.#instance = new Network();
        }

        return Network.#instance;
    }

    public async getMetroTrips(routeId : string) : Promise<Array<IMetroTrip> | undefined> {
        return TripsMetroNetworkRetriever.instance.retrieve(routeId);
    }

    public async getMetroShapes(shapeId : string) : Promise<Array<IMetroShape> | undefined> {
        return ShapesMetroNetworkRetriever.instance.retrieve(shapeId);
    }

    public async getMetroCalendar(serviceId : string) : Promise<IMetroCalendar | undefined> {
        return CalendarMetroNetworkRetriever.instance.retrieve(serviceId);
    }


    public async getPeakTrips(routeId : string) : Promise<Array<IPeakTrip> | undefined> {
        return TripsPeakNetworkRetriever.instance.retrieve(routeId);
    }

    public async getPeakShapes(shapeId : string) : Promise<Array<IPeakShape> | undefined> {
        return ShapesPeakNetworkRetriever.instance.retrieve(shapeId);
    }

    public async getPeakStops(stopId : string) : Promise<Array<any> | undefined> {
        return StopsPeakNetworkRetriever.instance.retrieve(stopId);
    }


    public async getNextTripStops(routeId : string, directionId : string) : Promise<any | undefined> {
        return StopsNextTripNetworkRetriever.instance.retrieve(routeId, directionId);
    }
}

abstract class NetworkRetriever {
    constructor(API_URL : string) { this.API_URL = API_URL; }

    abstract retrieve(...args : string[]) : any | undefined;

    protected readonly API_URL : string;
}

abstract class MetroNetworkRetriever extends NetworkRetriever {
    constructor() { super(process.env.REACT_APP_SUPABASE_FUNCTION_URL as string); }
}

abstract class NextTripNetworkRetriever extends NetworkRetriever {
    constructor() { super("https://svc.metrotransit.org/nextrip"); }
}

abstract class PeakNetworkRetriever extends NetworkRetriever {
    constructor() { super("https://api.peaktransit.com/v5/index.php?app_id=_RIDER&key=c620b8fe5fdbd6107da8c8381f4345b4&controller="); }
    protected readonly API_URL_END : string = "&action=list&agencyID=88";
}

class TripsMetroNetworkRetriever extends MetroNetworkRetriever {
    static #instance: TripsMetroNetworkRetriever;
    
    private constructor() {super();}

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

class ShapesMetroNetworkRetriever extends MetroNetworkRetriever {
    static #instance: ShapesMetroNetworkRetriever;
    
    private constructor() {super();}

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

class CalendarMetroNetworkRetriever extends MetroNetworkRetriever {
    static #instance: CalendarMetroNetworkRetriever;
    
    private constructor() {super();}

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

class TripsPeakNetworkRetriever extends PeakNetworkRetriever {
    static #instance: TripsPeakNetworkRetriever;
    static #trips: Array<IPeakTrip> | undefined;
    
    private constructor() {super();}

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

class ShapesPeakNetworkRetriever extends PeakNetworkRetriever {
    static #instance: ShapesPeakNetworkRetriever;
    static #shapes: Array<IPeakShape> | undefined;
    
    private constructor() {super();}

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

class StopsPeakNetworkRetriever extends PeakNetworkRetriever {
    static #instance: StopsPeakNetworkRetriever;
    static #stops: Array<any> | undefined;
    
    private constructor() {super();}

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

class StopsNextTripNetworkRetriever extends NextTripNetworkRetriever {
    static #instance: StopsNextTripNetworkRetriever;
    
    private constructor() {super();}

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