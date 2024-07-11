import React, {useEffect, useState} from 'react';

import URL from 'src/backend/URL.ts';
import Routes from 'src/frontend/Map/Routes.ts';

/**
 * Creates a route button with the route that the button leads to and the route that it leads to
 * @param routeId ID of the route
 * @param text Display text of the button
 * @returns 
 */
function RouteButton({ routeId, text }) {
  useEffect(() => {
    URL.addListener(() => {
      setActive(URL.getRoutes().has(routeId)); // updates color of button click immediately
    })
    
    setActive(URL.getRoutes().has(routeId));
  }, [])

  const [isActive, setActive] = useState(false);
  
  const removeInfoWindows = () => {
    // Get all markers associated with the routeId
    const stops = Routes.getRoute(routeId)?.getStops();
    // Iterate over markers and close their info windows
    stops?.forEach(stop => { stop.closeInfoWindow(); });
  };

  const buttonElement = React.createElement("button", {
    className: `route-btn ${isActive ? 'active' : undefined} route-${routeId}`,
    onClick: () => {
      // selects specific route depending on button pressed
      if (!isActive)
        URL.addRoute(routeId);
      else
        URL.removeRoute(routeId);

      // Remove info windows associated with the routeId
      removeInfoWindows();
    }
  }, text);

  return buttonElement;
}

export default RouteButton;
