import { IRoute } from "src/backend/interface/RouteInterface";
import { ITimeTable } from "src/backend/interface/ScheduleInterface";
import { IStop } from "src/backend/interface/StopInterface";

namespace Schedule {
    /**
     * Gets specified route data of all routes
     * @param routeId route ID
     * @returns route data
     */
    export async function getRoute(routeId: string) : Promise<IRoute | undefined> {
        const routes = await getRoutes();
        return routes.find(route => route.route_id === routeId);
    }

    /**
     * Gets more specified details about route
     * @param routeId route ID
     * @returns specified data about the route
     */
    export async function getRouteDetails(routeId: string) : Promise<IRoute> {
        const route = await getRoute(routeId);
        if (!route) {
            throw new Error(`Route with ID ${routeId} not found`);
        }

        return await (await fetch(`https://svc.metrotransit.org/schedule/routedetails/${route.route_url_param}`)).json();
    }

    /**
     * Gets stop list for the route and schedule
     * @param routeId route ID
     * @param scheduleId schedule ID
     * @returns stop list for the route schedule
     */
    export async function getStopList(routeId: string, scheduleId: number) : Promise<Array<IStop>> {
        return await (await fetch(`https://svc.metrotransit.org/schedule/stoplist/${routeId}/${scheduleId}`)).json();
    }

    /**
     * Gets the week of the date in terms of Sunday, Saturday, and Weekday
     * @returns day category as a string
     */
    export function getWeekDate() : string | undefined {
        const date = new Date();
        switch (date.getDay()) {
            case 0:
                return "Sunday";
            case 6:
                return "Saturday";
            default:
                return "Weekday";
        }
    }

    /* Private Helper Methods */

    /**
     * Gets all routes that are avalible
     * @returns list of all the routes
     */
    async function getRoutes() : Promise<Array<IRoute>> {
        return await (await fetch("https://svc.metrotransit.org/schedule/routes")).json();
    }

    /* Depreciated / Unused */
    
    /**
     * Gets current schedule of the route
     * @param routeId route ID
     * @returns combination of all data from schedule
     * @deprecated This is no longer used
     */
    async function getSchedule(routeId: string) : Promise<IRoute> {
        let detail = await getRouteDetails(routeId);

        for (let schedule of detail.schedules) {
            if (schedule.schedule_type_name === getWeekDate()) {
                for (let timetable of schedule.timetables) {
                    timetable.stop_list = await getStopList(routeId, timetable.schedule_number);
                    timetable.stop_list.forEach(async stop => stop.info = await (await fetch("https://svc.metrotransit.org/nextrip/"+stop.stop_id)).json());
                    timetable.table = await getTimeTable(routeId, timetable.schedule_number);
                }
            }
        }

        return detail;
    }

    /**
     * Gets time table for the route and schedule
     * @param routeId route ID
     * @param scheduleId schedule ID
     * @returns time table for the route schedule
     * @deprecated  This is no longer used (only used by other deprecated method)
     */
    async function getTimeTable(routeId: string, scheduleId: number) : Promise<Array<ITimeTable>> {
        return await (await fetch(`https://svc.metrotransit.org/schedule/timetable/${routeId}/${scheduleId}`)).json();
    }
}

export default Schedule;