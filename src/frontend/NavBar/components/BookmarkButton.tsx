import URL from 'src/backend/URL.ts';
import React, { useEffect, useState } from 'react';
import { BsBookmarkStar } from 'react-icons/bs';
import { ControlPosition, MapControl } from '@vis.gl/react-google-maps';
import ReactDOM from 'react-dom/client';
import RouteButton from './RouteButton.tsx';


    

export function BookmarkButton() {
    const [, forceReload] = useState(1);
    const [bookmarked, setBookmarked] = useState(false); 
    useEffect(() => setRoutes(URL.getRoutes()), []);
    const [routes, setRoutes] = useState(new Set<string>());


    URL.addListener(() => {
        forceReload(Math.random());
        setRoutes(URL.getRoutes());
    });

    

    const onClick = () => {
        // TODO: setBookmarked to flip the bookmark of a route
        // Temp
     
       console.log("here");

        const element = document.getElementById("Favorite-tab")!;
        const root = ReactDOM.createRoot(element);

        root.render(
            <div id = "Favorite-tab"> 

         
            <li>
                {Array.from(routes.keys()).map((routeId) => 
                <RouteButton key={routeId} routeId={routeId} text={routeId}/>
                
                )}
            </li>  
            </div>
          
        )

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