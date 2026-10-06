import { getCachedJSON } from "src/backend/Fetch.ts";

const HOUR = 60 * 60 * 1000;
namespace Schedule {
    /* Public */

    /**
     * Gets all the routes that are avalible
     * @returns a list of all the routes
     */
    export async function getRoutes() : Promise<Array<any>> {
        return await getCachedJSON("https://svc.metrotransit.org/schedule/routes", HOUR);
    }
    /**
     * Gets the specified route data of all routes
     * @param routeId the route ID
     * @returns the route data
     */
    export async function getRoute(routeId: string) : Promise<any> {
        return (await getRoutes())?.find(route => route.route_id === routeId);
    }
    /**
     * Gets more specified details about the route
     * @param routeId the route ID
     * @returns the specified data about the route
     */
    export async function getRouteDetails(routeId: string) : Promise<any> {
        const route = await getRoute(routeId);
        if (!route) return { schedules: [] };
        return (await getCachedJSON("https://svc.metrotransit.org/schedule/routedetails/"+route.route_url_param, HOUR)) ?? { schedules: [] }
    }
    /**
     * Gets the stop list for the route and schedule
     * @param routeId       route ID
     * @param scheduleId    schedule ID
     * @returns             stop list for the route schedule
     */
    export async function getStopList(routeId: string, scheduleId: number) : Promise<Array<any>> {
        return await getCachedJSON("https://svc.metrotransit.org/schedule/stoplist/"+routeId+"/"+scheduleId, HOUR)
    }

    /**
     * Gets a route's generated timetable (service spans by day and direction), or null if it has none
     * @param routeId the route ID
     */
    export function getTimetable(routeId: string) : Promise<any> {
        if (!timetables.has(routeId))
            timetables.set(routeId, fetch(process.env.PUBLIC_URL + "/gtfs/schedules/" + routeId + ".json")
                .then(response => response.ok && response.headers.get("content-type")?.includes("json") ? response.json() : null)
                .catch(() => { timetables.delete(routeId); return null; }));
        return timetables.get(routeId)!;
    }
    const timetables = new Map<string, Promise<any>>();

    /**
     * Gets today's schedule type: "Weekday", "Saturday" or "Sunday"
     */
    export function getWeekDate() : string {
        const day = new Date().getDay();
        return day === 0 ? "Sunday" : day === 6 ? "Saturday" : "Weekday";
    }
}

export default Schedule;