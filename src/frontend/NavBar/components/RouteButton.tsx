import React, {useState} from 'react';

import URL from '../../../backend/URL.ts';

import Routes from '../../Map/Routes.ts';
import Vehicles from '../../Map/Vehicles.ts';

/**
 * Creates a route button with the route that the button leads to and the route that it leads to
 * @param routeId ID of the route
 * @param text Display text of the button
 * @returns 
 */
function RouteButton({ routeId, text }) {
  const [_, setForceUpdate] = useState(0);
  const isActive = Array.from(URL.getRoutes()).includes(routeId); // used to check if route button is active

    return (
      <button className={`route-btn ${isActive ? 'active' : ''} route-${routeId}`} onClick={() => {
        // selects specific route depending on button pressed
        if (!URL.getRoutes().has(routeId))
            URL.addRoute(routeId);
        else 
            URL.removeRoute(routeId);
        
        Routes.refresh();
        Vehicles.refresh();
        setForceUpdate(Math.random()); // updates color of button click immediately
      }}>
          {text}
      </button>
  )
}

export default RouteButton;
