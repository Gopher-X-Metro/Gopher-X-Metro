import _DataAbstract from "./_DataAbstract";
import Realtime from "../../backend/Realtime";
import Data from "../Data";

interface info {
    stopId: string | undefined;
    latitude: number | undefined;
    longitude: number | undefined;
}

export default class _Stop extends _DataAbstract {
    constructor(stopId: string, placeCode: string, directionId: number, routeId: string, data: any) {
        super(stopId);
        this.directionId = directionId;
        this.routeId = routeId;
        this.placeCode = placeCode;

        this.data = data;
    }

    static async create(stopId: string, placeCode: string, directionId: number, routeId: string, data: any) : Promise<Data.Stop> {
        const stop = new Data.Stop(stopId, placeCode, directionId, routeId, data);
        return stop;
    }

    public readonly data: any;

    public readonly directionId: number;
    public readonly routeId: string;
    public readonly placeCode: string;
}