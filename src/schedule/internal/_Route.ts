import Schedule from "../Schedule";

export default class _Route {
    public readonly routeId: string;
    public readonly agencyId: number;
    public readonly data: Schedule.Interface.Route
    public readonly detail: Promise<Schedule.Detail>;
    
    constructor (routeId: string, agencyId: number, data : Schedule.Interface.Route) {
        this.data = data;
        
        this.routeId = routeId;
        this.agencyId = agencyId;

        this.detail = fetch(`https://svc.metrotransit.org/schedule/routedetails/${this.data.route_url_param}`)
        .then(async response => {
            if (!response.ok) {
                throw new Schedule.FetchError(`Failed to fetch route detail '${this.data.route_url_param}'`);
            }

            return new Schedule.Detail(routeId, agencyId, this.data.route_url_param, await response.json());
        })
    }
}