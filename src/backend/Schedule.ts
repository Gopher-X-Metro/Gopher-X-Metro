namespace Schedule {
    /**
     * Gets all the routes that are avalible
     * @returns a list of all the routes
     */
    export async function getRoutes() : Promise<Array<any>> {
        return await (await fetch("https://svc.metrotransit.org/schedule/routes")).json();
    }
    /**
     * Gets the specified route data of all routes
     * @param routeId the route ID
     * @returns the route data
     */
    export async function getRoute(routeId: string) : Promise<any> {
        for (const route of await getRoutes())
            if (route.route_id === routeId) 
                return route;
    }
    /**
     * Gets more specified details about the route
     * @param routeId the route ID
     * @returns the specified data about the route
     */
    export async function getRouteDetails(routeId: string) : Promise<Array<any>> {
        return await (await fetch("https://svc.metrotransit.org/schedule/routedetails/"+(await getRoute(routeId)).route_url_param)).json()
    }
    /**
     * 
     * @param routeId 
     * @param scheduleId 
     * @returns 
     */
    export async function getTimeTable(routeId: string, scheduleId: number) : Promise<Array<any>> {
        return await (await fetch("https://svc.metrotransit.org/schedule/timetable/"+routeId+"/"+scheduleId)).json()
    }
    export async function getStopList(routeId: string, scheduleId: number) : Promise<Array<any>> {
        return await (await fetch("https://svc.metrotransit.org/schedule/stoplist/"+routeId+"/"+scheduleId)).json()
    }
}

export default Schedule;