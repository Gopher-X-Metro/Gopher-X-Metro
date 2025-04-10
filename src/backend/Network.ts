import { ICalendar } from "./interface/CalendarInterface";
import { IShape } from "./interface/ShapeInterface";
import { ITrip } from "./interface/TripInterface";

export class Network {
    static #instance: Network;
    
    private constructor() {}

    public static get instance(): Network {
        if (!Network.#instance) {
            Network.#instance = new Network();
        }

        return Network.#instance;
    }

    public async getMetroTrips(routeId : string) : Promise<Array<ITrip> | undefined> {
        return TripsMetroNetworkRetriever.instance.retrieve<Array<ITrip>>(routeId);
    }

    public async getMetroShapes(shapeId : string) : Promise<Array<IShape> | undefined> {
        return ShapesMetroNetworkRetriever.instance.retrieve<Array<IShape>>(shapeId);
    }

    public async getMetroCalendar(serviceId : string) : Promise<ICalendar | undefined> {
        return CalendarMetroNetworkRetriever.instance.retrieve<ICalendar>(serviceId);
    }


    public async getPeakTrips(routeId : string) : Promise<Array<any> | undefined> {
        return TripsPeakNetworkRetriever.instance.retrieve<Array<any>>(routeId);
    }

    public async getPeakShapes(shapeId : string) : Promise<Array<any> | undefined> {
        return ShapesPeakNetworkRetriever.instance.retrieve<Array<any>>(shapeId);
    }
}


class RetreiveError extends Error {
    constructor (message: any) {
        super(message);

        this.name = "RetreiveError";
    }
}

abstract class NetworkRetriever {
    constructor(API_URL : string) { this.API_URL = API_URL; }

    abstract retrieve<Interface>(data : string) : Promise<Interface | undefined>;

    protected readonly API_URL : string;
}

abstract class MetroNetworkRetriever extends NetworkRetriever {
    constructor() { super(process.env.REACT_APP_SUPABASE_FUNCTION_URL as string); }
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

    async retrieve<ITrips>(routeId : string): Promise<ITrips | undefined> {
        return fetch(`${this.API_URL}/api/get-trips?route_id=${routeId}`)
        .then((response : Response) => 
            response.ok ? 
            response.json().then((json : ITrips) => json) 
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

    async retrieve<IShapes>(routeId : string): Promise<IShapes | undefined> {
        return fetch(`${this.API_URL}/api/get-shapes?shape_id=${routeId}`)
        .then((response : Response) => 
            response.ok ? 
            response.json().then((json : IShapes) => json) 
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

    async retrieve<ICalendar>(routeId : string): Promise<ICalendar | undefined> {
        return fetch(`${this.API_URL}/api/get-calendar?service_id=${routeId}`)
        .then((response : Response) => 
            response.ok ? 
            response.json().then((json : ICalendar) => json) 
            : undefined
        );
    }
}

class TripsPeakNetworkRetriever extends PeakNetworkRetriever {
    static #instance: TripsPeakNetworkRetriever;
    static #trips: Array<any> | undefined;
    
    private constructor() {super();}

    public static get instance(): TripsPeakNetworkRetriever {
        if (!TripsPeakNetworkRetriever.#instance) {
            TripsPeakNetworkRetriever.#instance = new TripsPeakNetworkRetriever();
        }

        return TripsPeakNetworkRetriever.#instance;
    }

    async retrieve<ITrips>(routeId : string): Promise<ITrips | undefined> {
        if (!TripsPeakNetworkRetriever.#trips) {
            TripsPeakNetworkRetriever.#trips = await fetch(`${this.API_URL}route2${this.API_URL_END}`)
            .then((response : Response) => 
                response.ok ? 
                response.json().then((json : any) => json.routes) 
                : undefined
            );
        }

        return TripsPeakNetworkRetriever.#trips?.filter((trip) => trip.routeID.toString() === routeId) as ITrips; 
    }
}

class ShapesPeakNetworkRetriever extends PeakNetworkRetriever {
    static #instance: ShapesPeakNetworkRetriever;
    static #shapes: Array<any> | undefined;
    
    private constructor() {super();}

    public static get instance(): ShapesPeakNetworkRetriever {
        if (!ShapesPeakNetworkRetriever.#instance) {
            ShapesPeakNetworkRetriever.#instance = new this();
        }

        return ShapesPeakNetworkRetriever.#instance;
    }

    async retrieve<IShapes>(shapeId : string): Promise<IShapes | undefined> {
        if (!ShapesPeakNetworkRetriever.#shapes) {
            ShapesPeakNetworkRetriever.#shapes = await fetch(`${this.API_URL}shape2${this.API_URL_END}`)
            .then((response : Response) => 
                response.ok ? 
                response.json().then((json : any) => json.shape) 
                : undefined
            );
        }

        return ShapesPeakNetworkRetriever.#shapes?.filter((shape) => shape.shapeID.toString() === shapeId) as IShapes; 
    }
}