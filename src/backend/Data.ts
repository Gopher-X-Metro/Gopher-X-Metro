import Network, { IMetroShape, IMetroTrip, IPeakShape, IPeakTrip } from "./Network";

interface IPoint {
    lat: number,
    lng: number,
    sequence: number
}

interface IPath {
    routeId: string;
    shapeId: string;
    points: Array<IPoint>;
}

export default class Data{
    static #instance: Data;
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

    public static get instance(): Data {
        if (!Data.#instance) {
            Data.#instance = new Data();
        }

        return Data.#instance;
    }

    public async getTrips(routeId: string) : Promise<Array<IMetroTrip | IPeakTrip> | undefined> {
        return TripsDataRetriever.instance.retrieve(routeId);
    }

    public async getShapes(shapeId: string) : Promise<Array<IMetroShape | IPeakShape> | undefined> {
        return ShapesDataRetriever.instance.retrieve(shapeId);
    }

    public async getPaths(routeId: string) : Promise<Array<IPath> | undefined> {
        return PathsDataRetriever.instance.retrieve(routeId);
    }


    public getUniversityRouteId(routeId: string) : number | undefined {
        return Data.#UNIVERSITY_ROUTES[routeId];
    }
}

abstract class DataRetriever {
    abstract retrieve(...args: string[]) : any | undefined;
}

class TripsDataRetriever extends DataRetriever {
    static #instance: TripsDataRetriever;
    
    private constructor() { super(); }

    public static get instance(): TripsDataRetriever {
        if (!TripsDataRetriever.#instance) {
            TripsDataRetriever.#instance = new TripsDataRetriever();
        }

        return TripsDataRetriever.#instance;
    }

    async retrieve(routeId : string): Promise<Array<IMetroTrip | IPeakTrip> | undefined> {
        const id = Data.instance.getUniversityRouteId(routeId); 
        
        if (!id) {
            const data = await Network.instance.getMetroTrips(routeId); 
            return data
        }
        
        return Network.instance.getPeakTrips(id?.toString());
    }
}

class ShapesDataRetriever extends DataRetriever {
    static #instance: ShapesDataRetriever;
    
    private constructor() { super(); }

    public static get instance(): ShapesDataRetriever {
        if (!ShapesDataRetriever.#instance) {
            ShapesDataRetriever.#instance = new ShapesDataRetriever();
        }

        return ShapesDataRetriever.#instance;
    }

    async retrieve(shapeId : string): Promise<Array<IMetroShape | IPeakShape> | undefined> {
        const data = await Network.instance.getMetroShapes(shapeId);
        
        if (data && data.length > 0) {
            return data
        }

        return Network.instance.getPeakShapes(shapeId);
    }
}

class PathsDataRetriever extends DataRetriever {
    static #instance: PathsDataRetriever;
    
    private constructor() { super(); }

    public static get instance(): PathsDataRetriever {
        if (!PathsDataRetriever.#instance) {
            PathsDataRetriever.#instance = new PathsDataRetriever();
        }

        return PathsDataRetriever.#instance;
    }

    async retrieve(routeId : string): Promise<Array<IPath> | undefined> {
        const university = Data.instance.getUniversityRouteId(routeId) != undefined;

        const trips = await TripsDataRetriever.instance.retrieve(routeId);
        
        if (!trips) { return undefined; }

        const paths : Map<number, IPath> = new Map<number, IPath>();

        for (const trip of trips) {
            const shapeId = university ? (trip as IPeakTrip).shapeID : (trip as IMetroTrip).shape_id;

            if (paths.has(shapeId)) {
                continue;
            }

            const shapes = await ShapesDataRetriever.instance.retrieve(shapeId.toString());
                    
            if (!shapes) { return undefined; }

            let points = new Set<IPoint>();
            for (const shape of shapes) {
                if (university) {
                    (shape as IPeakShape).points.split(";").forEach((point, index) => {
                        const split = point.split(",");
                        if (split.length == 2) {
                            points.add({lat: Number(split[0]), lng: Number(split[1]), sequence: index});
                        }
                    })
                } else {
                    const point = shape as IMetroShape;
                    
                    points.add({lat: point.shape_pt_lat, lng: point.shape_pt_lon, sequence: point.shape_pt_sequence});
                }
            }

            paths.set(shapeId, {routeId: routeId, shapeId: shapeId.toString(), points: Array.from(points.keys())});
        }

        return Array.from(paths.values());
    }
}