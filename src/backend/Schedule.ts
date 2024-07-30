export namespace Schedule {
    /* Public */

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
    export async function getRouteDetails(routeId: string) : Promise<any> {
        return await (await fetch("https://svc.metrotransit.org/schedule/routedetails/"+(await getRoute(routeId)).route_url_param)).json()
    }
    /**
     * Gets the time table for the route and schedule
     * @param routeId       route ID
     * @param scheduleId    schedule ID
     * @returns             time table for the route schedule
     */
    export async function getTimeTable(routeId: string, scheduleId: number) : Promise<Array<any>> {
        return await (await fetch("https://svc.metrotransit.org/schedule/timetable/"+routeId+"/"+scheduleId)).json()
    }
    /**
     * Gets the stop list for the route and schedule
     * @param routeId       route ID
     * @param scheduleId    schedule ID
     * @returns             stop list for the route schedule
     */
    export async function getStopList(routeId: string, scheduleId: number) : Promise<Array<any>> {
        return await (await fetch("https://svc.metrotransit.org/schedule/stoplist/"+routeId+"/"+scheduleId)).json()
    }
    /**
     * Gets the current schedule of the route
     * @param routeId       route ID
     * @returns             a combination of all data from schedule
     */
    export async function getSchedule(routeId: string) : Promise<any> {
        let detail = await getRouteDetails(routeId)

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
     * This function checks to make sure that the inputted route on 
     * the searchfeature is a valid route
     * @param route route that is passed in
     * @returns true or false
     */
    export async function checkRoute(route:string){
      const url = 'https://svc.metrotransit.org/NexTrip/Routes';
       try{
        const response = await fetch(url);

        if(!response.ok){
            throw new Error("error with fetch");
        }
        
        const data = await response.json();
        
        for(let i = 0; i < data.length; i++){
            if(data[i].route_id == route){
                return true;
            }
        }
        return false;

       }catch(error){
        console.log(error);
       }
    } 
    }

    /* Private */

    /**
     * Gets the week of the date in terms of Sunday, Saturday, and Weekday
     */
    function getWeekDate() : string | undefined {
        const date = new Date();
        switch (date.getDay()) {
            case 0:
                return "Sunday"
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                return "Weekday"
            case 6:
                return "Saturday"
        }
    }


export default Schedule;

function then(arg0: (details: any) => void) {
    throw new Error("Function not implemented.");
}
