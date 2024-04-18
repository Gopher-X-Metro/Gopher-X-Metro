import URL from '../../../backend/URL.ts';
import Routes from '../../Map/Routes.ts';
import Vehicles from '../../Map/Vehicles.ts';

namespace SearchFeature {
    export function searchRoute() {
        let routeInput = document.getElementById("search_route") as HTMLInputElement | null;
    
        if (routeInput) {
            let bus_route: string = routeInput.value;
            console.log("Search Route: \"" + bus_route + "\"");
            
            if(isNaN(parseInt(bus_route))) {
                console.warn("Invalid Input");
            } else {
                if (!URL.getRoutes().has(bus_route) && count == 0) {
                    console.log(bus_route + " 1st if");
                    URL.addRoute(bus_route);
                    //URL.removeRoute(old_route);
                    count++;
                    console.log("count 1st " + count);
                    old_route = bus_route;
                    console.log(old_route + " old");
                    
                } else if (URL.getRoutes().has(old_route) && count == 1) {
                    console.log("OLDDD " + old_route);
                    console.log("count second if " + count);
                    // URL.addRoute(bus_route);
                    //count--;
                    URL.removeRoute(old_route);
                    URL.addRoute(bus_route);
                    old_route = bus_route;
                }else if (URL.getRoutes().has(bus_route)) {
                    URL.removeRoute(bus_route);
                }
            }

            Routes.refresh();
            Vehicles.refresh();
        } else {
            console.log("error input is NULL");
        }
    }

    let count = 0;
    let old_route: string;
}

export default SearchFeature
