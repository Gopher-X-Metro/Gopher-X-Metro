import React, {useState} from 'react';

import URL from 'src/backend/URL.ts';
import Routes from 'src/frontend/Map/Routes.ts';

/**
 * Creates a route button with the route that the button leads to and the route that it leads to
 * @param routeId ID of the route
 * @param text Display text of the button
 * @returns 
 */
function RouteButton({ routeId, text }) {
  const [_, setForceUpdate] = useState(0);
  const isActive = Array.from(URL.getRoutes()).includes(routeId); // used to check if route button is active

  const removeInfoWindows = () => {
    // Get all markers associated with the routeId
    const stops = Routes.getRoute(routeId)?.getStops();
    // Iterate over markers and close their info windows
    if (stops)
        stops.forEach(stop => { stop.closeInfoWindow(); });
  };
  
  return (
      <button className={`route-btn ${isActive ? 'active' : ''} route-${routeId}`} onClick={() => {
          // selects specific route depending on button pressed
          if (!URL.getRoutes().has(routeId))
              URL.addRoute(routeId);
          else
              URL.removeRoute(routeId);

          // Remove info windows associated with the routeId
          removeInfoWindows();
          setForceUpdate(Math.random()); // updates color of button click immediately
      }}>
          {text}
      </button>
  )
}

export default RouteButton;
