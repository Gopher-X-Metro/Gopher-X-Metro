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

    public async getTrips(routeId : string) : Promise<ITrip | undefined> {
        const value = TripsNetworkRetriever.instance.retrieve<ITrip>(routeId);
        
        if (!value) {
            throw new RetreiveError("Network getTrip could not get a trip!");
        }
        
        return value;
    }

    public async getShapes(shapeId : string) : Promise<IShape | undefined> {
        const value = ShapesNetworkRetriever.instance.retrieve<IShape>(shapeId);
        
        if (!value) {
            throw new RetreiveError("Network getShapes could not get a shape!");
        }

        return value;
    }

    public async getCalendar(serviceId : string) : Promise<ICalendar | undefined> {
        const value = CalendarNetworkRetriever.instance.retrieve<ICalendar>(serviceId);
        
        if (!value) {
            throw new RetreiveError("Network getCalendar could not get a calendar!");
        }
     
        return value;
    }
}


class RetreiveError extends Error {
    constructor (message: any) {
        super(message);

        this.name = "RetreiveError";
    }
}

abstract class NetworkRetriever {
    abstract retrieve<Interface>(data : string) : Promise<Interface | undefined>;

    /* API base URL */
    public static readonly API_URL : string = process.env.REACT_APP_SUPABASE_FUNCTION_URL as string;
}

class TripsNetworkRetriever extends NetworkRetriever {
    static #instance: TripsNetworkRetriever;
    
    private constructor() {super();}

    public static get instance(): TripsNetworkRetriever {
        if (!TripsNetworkRetriever.#instance) {
            TripsNetworkRetriever.#instance = new TripsNetworkRetriever();
        }

        return TripsNetworkRetriever.#instance;
    }

    async retrieve<ITrip>(routeId : string): Promise<ITrip | undefined> {
        return fetch(`${NetworkRetriever.API_URL}/api/get-trips?route_id=${routeId}`)
        .then((response : Response) => 
            response.ok ? 
            response.json().then((json : ITrip) => json) 
            : undefined
        );
    }
}

class ShapesNetworkRetriever extends NetworkRetriever {
    static #instance: ShapesNetworkRetriever;
    
    private constructor() {super();}

    public static get instance(): ShapesNetworkRetriever {
        if (!ShapesNetworkRetriever.#instance) {
            ShapesNetworkRetriever.#instance = new this();
        }

        return ShapesNetworkRetriever.#instance;
    }

    async retrieve<IShapes>(routeId : string): Promise<IShapes | undefined> {
        return fetch(`${NetworkRetriever.API_URL}/api/get-shapes?shape_id=${routeId}`)
        .then((response : Response) => 
            response.ok ? 
            response.json().then((json : IShapes) => json) 
            : undefined
        );
    }
}

class CalendarNetworkRetriever extends NetworkRetriever {
    static #instance: CalendarNetworkRetriever;
    
    private constructor() {super();}

    public static get instance(): CalendarNetworkRetriever {
        if (!CalendarNetworkRetriever.#instance) {
            CalendarNetworkRetriever.#instance = new CalendarNetworkRetriever();
        }

        return CalendarNetworkRetriever.#instance;
    }

    async retrieve<ITrip>(routeId : string): Promise<ITrip | undefined> {
        return fetch(`${NetworkRetriever.API_URL}/api/get-calendar?service_id=${routeId}`)
        .then((response : Response) => 
            response.ok ? 
            response.json().then((json : ITrip) => json) 
            : undefined
        );
    }
}