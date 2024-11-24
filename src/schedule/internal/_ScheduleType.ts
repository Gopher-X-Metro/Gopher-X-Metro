import Schedule from "../Schedule";

export default class _ScheduleType {
    public readonly routeId: string;
    public readonly agencyId: number;
    public readonly routeUrlParam: string;
    public readonly scheduleTypeName: string;

    public readonly timetables: Array<Schedule.Timetable>

    protected readonly data: Schedule.Interface.ScheduleType;

    constructor (scheduleTypeName: string, routeUrlParam: string, agencyId: number, routeId: string, data: Schedule.Interface.ScheduleType) {
        this.routeId = routeId;
        this.agencyId = agencyId;
        this.routeUrlParam = routeUrlParam;
        this.scheduleTypeName = scheduleTypeName;

        this.timetables = new Array<Schedule.Timetable>();

        for (const timetable of data.timetables) {
            this.timetables.push(Schedule.Timetable.create(timetable.schedule_number, scheduleTypeName, routeUrlParam, agencyId, routeId, timetable))
        }

        this.data = data;
    }
}