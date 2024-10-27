import URL from 'src/backend/URL.ts';
import React, { useEffect, useState } from 'react';
import { BsBookmarkStar } from 'react-icons/bs';
import { ControlPosition, MapControl } from '@vis.gl/react-google-maps';
import ReactDOM from 'react-dom/client';
import RouteButton from './RouteButton.tsx';
import Schedule from 'src/backend/Schedule.ts';


    

export function BookmarkButton() {
    const [, forceReload] = useState(1);
    const [bookmarked, setBookmarked] = useState(false); 
    const [routes, setRoutes] = useState(new Map<string,string>());



    useEffect(() => {
      
        /**
         * Convert a string to a properly cased title
         * @param input input string
         */
        const toTitleCase = (input : string) => { 
            return input.replace( 
                /\w\S*/g, 
                text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase() 
            ); 
        }

        /**
         * Updates the displayed routes on the sidebar
         */ 
        const change = async () => {
            for (const routeId of URL.getRoutes()) {
                if (!routes.has(routeId)) {
                    const info = await Schedule.getRoute(routeId);
                    const name = info ? info.route_label : routeId;
                    routes.set(routeId, toTitleCase(name));
                }
            }

            setRoutes(routes);
            forceReload(Math.random());
        }

        URL.addListener(() => change());

        change();
    }, [])

    

    const onClick = () => {
        // TODO: setBookmarked to flip the bookmark of a route
        // Temp

        // routes.set("123", "Route 123");

     
         const root = ReactDOM.createRoot(document.getElementById('Favorite-tab'));

         const element =   <div>
                 {Array.from(routes.keys()).map((routeId) => 
                <RouteButton key={routeId} routeId={routeId} text={routeId}/>
                
                )}
            </div>
        root.render(element);
          
        
        console.log(routes);
        setBookmarked(true);
      
    }

    return (
        <>
            <MapControl position={ControlPosition.RIGHT_BOTTOM}>
                <button hidden={routes.size !== 1}
                        id="bookmark-button" 
                        draggable="false"
                        aria-label="Center"
                        title="Center"
                        type="button"
                        className={"map-control-button bookmark-button" + (bookmarked ? " bookmarked" : "")} 
                        onClick={() => onClick()}>
                <BsBookmarkStar   className="icon" size={30}/>
                </button>
            </MapControl>
        </>
        


    )
}

export default BookmarkButton;