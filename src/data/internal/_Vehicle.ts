import _DataAbstract from "./_DataAbstract";
import Realtime from "../../backend/Realtime";
import Data from "../Data";

export default class _Vehicle extends _DataAbstract {
    constructor(vehicleId: string, directionId: number, routeId: string, data: any) {
        super(vehicleId);
        this.directionId = directionId;
        this.routeId = routeId;
        this.data = data;
    }

    public readonly data : any;

    static async create(vehicleId: string, directionId: number, routeId: string, data: any) : Promise<Data.Vehicle> {
        const vehicle = new Data.Vehicle(vehicleId, directionId, routeId, data);
        return vehicle;
    }

    private readonly directionId: number;
    private readonly routeId: string;
}