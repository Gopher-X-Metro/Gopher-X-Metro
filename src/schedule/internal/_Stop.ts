import Schedule from "../Schedule";

export default class _Stop {
    public readonly routeId: string;
    public readonly agencyId: number;
    public readonly routeUrlParam: string;
    public readonly scheduleTypeName: string;
    public readonly scheduleNumber: number;
    
    constructor(scheduleNumber: number, scheduleTypeName: string, routeUrlParam: string, agencyId: number, routeId: string, data: Schedule.Interface.Stop) {
        this.routeId = routeId;
        this.agencyId = agencyId;
        this.routeUrlParam = routeUrlParam;
        this.scheduleTypeName = scheduleTypeName;
        this.scheduleNumber = scheduleNumber;
    }
}