import URL from 'src/backend/URL.ts';
import Routes from 'src/frontend/Map/Routes.ts';
import Vehicles from 'src/frontend/Map/elements/Vehicle';
import Schedule from 'src/backend/Schedule'; 

namespace SearchFeature {
    export async function searchRoute() {

        let routeInput = document.getElementById("search_route") as HTMLInputElement | null;
        let cur_route: string = "";
        if (!routeInput) { // checks if routeInput has a value
            console.log("error input is not a value");
        }

        else{
           cur_route = routeInput.value; //stores the current route
           let Route_valid_check = await Schedule.checkRoute(cur_route);
           console.log(Route_valid_check, "status: returned from function");
           
        
            /**Checks to make sure that the route is a current route */
            if(Route_valid_check === false){
                console.log("route doesnt exist");
                //error message to user
                const error_check = document.getElementById("error_text")!;
                error_check.style.display = "block";
                error_check.innerHTML = "Route doesn't exist!";
                return;
            }
            
            else { //is a number

                /** clears the html text*/
                const test = document.getElementById("error_text")!;
                test.style.display = "none";
                test.innerHTML = '';
                
                
                
               /**isnt already in the url and count var is = 0 */ 
                if (!URL.getRoutes().has(cur_route) && count === 0) { 
                    URL.addRoute(cur_route);
                    count++; //indicates that there is a route in url
                    old_route = cur_route;
                } 

                /** doesn't allow duplicate routes to be added and checks if url countains a route already*/ 
                else if(!URL.getRoutes().has(old_route) && count === 1){
                    URL.removeRoute(old_route); //remove old and add new
                    URL.addRoute(cur_route);
                    old_route = cur_route;
                }

                /** removes the current route if the user inputs the same route   */
                else if (URL.getRoutes().has(cur_route)) {
                    URL.removeRoute(cur_route);
                    count = 0 ;
                }
                /** only allow 1 route at a time and doesn't allow duplicates*/ 
                else if (URL.getRoutes().has(old_route) && count === 1) { 
                    URL.removeRoute(old_route); //remove old and add new
                    URL.addRoute(cur_route);
                    old_route = cur_route;
                }
            }

            Routes.refresh();
            Routes.refreshVehicles();
            
        }
    }

    let count = 0;
    let old_route: string;
}

export default SearchFeature
