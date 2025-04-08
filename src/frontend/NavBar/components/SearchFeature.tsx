import URL from "src/backend/URL";
import Schedule from "src/backend/Schedule"; 
import Peak from "src/backend/Peak";
import SearchIcon from "src/img/CustomBus.png";
import React, {useState } from "react";

let nextId = 0;
export default function SearchFeature() {
    const [inputRoute, setInputRoute] = useState<string>(''); //holds current route
    const [routes, setRoutes] = useState<{ id: number; inputRoute: string }[]>([]); //holds array routes
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error state


     /* Input validation **/

    async function validRoute(){
        const routeId = inputRoute.trim();

        if (!routeId) {
            setErrorMessage("Please enter a valid route.");
            return;
        }
        const routeExists = Peak.UNIVERSITY_ROUTES[routeId] || (await Schedule.getRoute(routeId));
        if (!routeExists) {
            setErrorMessage("Route doesn't exist!");
            console.log("ROUTE DONT EXIST");
            return;
        } else {
            setErrorMessage(null);
            toggleRoute(routeId);
           // setInputRoute(""); // Clear input after validation
        }
       
    }


    /**Adds and removes route from array */
    function toggleRoute(routeId :string){
      setRoutes(prevRoutes => {
        const newRoutes = [...prevRoutes];
        const existingRoute = newRoutes.findIndex(route => route.inputRoute === routeId);

        if(existingRoute !==-1){//it exist so remove
            newRoutes.splice(existingRoute,1);
        }else{///add route since it doesnt exist
            newRoutes.push({id:nextId++,inputRoute: routeId});
            //URL.addRoute(routeId);
        }
        return newRoutes;
        
      });

      console.log(routes," routes");
      //update URL

    }

    return (
        <>
                <div>
                    {routes.map(routes => (
                        <button className="route-btn" key={routes.id}>{ "Route " + routes.inputRoute}</button>
                    ))}

                </div>
            <div className="search-header"> 
                <h3>Search Routes</h3>
                <div className="underline"></div>
            </div> 
        
            <div className="searchContainer">
                <input 
                    type="text" 
                    id="search_route" 
                    placeholder="902" 
                    value={inputRoute} 
                    onChange={(e) => setInputRoute(e.target.value)}
                />

                <button 
                    id="searchButton" className='route-btn'
                    onClick={validRoute}   
                >
                    <img className="busImg" height="50" width="50" alt="Search" src={SearchIcon} />
                </button>
            </div>
            {errorMessage && <div className="error_text">{errorMessage}</div>}

                
        </>
    ); 

    /* Private Helper Methods */

    /**
     * Shows the error of the route not existing
     * @param show if the error should be shown
     */
    function showError( show : boolean ) : void {
        const errorElement = document.getElementById("error_text")!;

        if (show) {
            errorElement.style.display = "block";
            errorElement.innerHTML = "Route doesn't exist!";
        } else {
            errorElement.style.display = "none";
            errorElement.innerHTML = "";
        }
    }
    }//ends function

