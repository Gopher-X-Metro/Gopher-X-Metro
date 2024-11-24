import Schedule from "../Schedule";

export default class _Timetable {
    public readonly routeId: string;
    public readonly agencyId: number;
    public readonly routeUrlParam: string;
    public readonly scheduleTypeName: string;
    public readonly scheduleNumber: number;
    
    protected readonly data: Schedule.Interface.TimetableDetail;

    public readonly detail: Promise<Schedule.Interface.Timetable>;

    public readonly stops: Promise<Array<Schedule.Stop>>;

    constructor(scheduleNumber: number, scheduleTypeName: string, routeUrlParam: string, agencyId: number, routeId: string, data: Schedule.Interface.TimetableDetail) {
        this.routeId = routeId;
        this.agencyId = agencyId;
        this.routeUrlParam = routeUrlParam;
        this.scheduleTypeName = scheduleTypeName;
        this.scheduleNumber = scheduleNumber;

        this.data = data;

        this.stops = fetch(`https://svc.metrotransit.org/schedule/stoplist/${routeId}/${scheduleNumber}`)
        .then(response => {
            if (!response.ok) {
                throw new Schedule.FetchError(`Failed to fetch stops of schedule '${scheduleNumber}' in route '${routeId}'`)
            }

            return response.json().then((stops : Array<Schedule.Interface.Stop>) => stops.map(stop => new Schedule.Stop(scheduleNumber, scheduleTypeName, routeUrlParam, agencyId, routeId, stop)))
        })

        this.detail = fetch(`https://svc.metrotransit.org/schedule/timetable/${routeId}/${scheduleNumber}`)
        .then(response => {
            if (!response.ok) {
                throw new Schedule.FetchError(`Failed to fetch timetable of schedule '${scheduleNumber}' in route '${routeId}'`)
            }

            return response.json()
        })
    }
}