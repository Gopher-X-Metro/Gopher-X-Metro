import _DataAbstract from "./_DataAbstract";
import Realtime from "../../backend/Realtime";
import Data from "../Data";


export default class _Departure extends _DataAbstract {
    constructor(departureId: string, stopId: string, directionId: number, routeId: string, data: any) {
        super(departureId);
        this.stopId = stopId;
        this.directionId = directionId;
        this.routeId = routeId;

        this.data = data;
    }

    static async create(departureId: string, stopId: string, directionId: number, routeId: string, data: any) : Promise<Data.Departure> {
        const departure = new Data.Departure(departureId, stopId, directionId, routeId, data);
        return departure;
    }

    public readonly data : any;
    public readonly stopId: string;
    public readonly directionId: number;
    public readonly routeId: string;
}