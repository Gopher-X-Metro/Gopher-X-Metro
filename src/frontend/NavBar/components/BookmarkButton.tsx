import URL from 'src/backend/URL.ts';
import React, { useEffect, useState, useRef } from 'react';
import { BsBookmarkStar } from 'react-icons/bs';
import { ControlPosition, MapControl } from '@vis.gl/react-google-maps';
import ReactDOM from 'react-dom/client';
import RouteButton from './RouteButton.tsx';
import Schedule from 'src/backend/Schedule.ts';
import { ring } from '@chakra-ui/react';



export function BookmarkButton() {
    const [, forceReload] = useState(1);
    const [bookmarked, setBookmarked] = useState(false); 
    const [routes, setRoutes] = useState(new Set<string>());
    const rootRef = useRef(null);



  useEffect(() => setRoutes(URL.getRoutes()), [])

    URL.addListener(() => {
        forceReload(Math.random());
        setRoutes(URL.getRoutes());
    });

    

    const onClick = () => {
        // TODO: setBookmarked to flip the bookmark of a route
        setBookmarked(true);

        const root = ReactDOM.createRoot(document.getElementById('Favorite-tab'));
        console.log(routes.size, "size");
     
         const element = <div>
                 {Array.from(routes.keys()).map((routeId) => 
                <RouteButton key={routeId} routeId={routeId} text={"Route " + routeId}/>
                
                )}
            </div>
        root.render(element);
          
        
        console.log(routes);
        
      
    }

    return (
        <>
            <MapControl position={ControlPosition.RIGHT_BOTTOM}>
              
                <button hidden={URL.getRoutes().size !== 1}
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