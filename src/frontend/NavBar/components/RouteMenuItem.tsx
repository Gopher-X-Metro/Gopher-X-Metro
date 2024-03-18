import React from "react";
import URL from '../../../backend/URL.ts';
import Routes from '../../Routes.ts';
import Vehicles from '../../Vehicles.ts';

import { 
    MenuItemOption
} from '@chakra-ui/react'


/**
 * Creates a route button with the route that the button leads to and the route that it leads to
 * @param routeId ID of the route
 * @param text Display text of the button
 * @returns 
 */
export default function RouteMenuItem({routeId, text}) {
    return (
      <MenuItemOption value={routeId} onClick={() => {
        // selects specific route depending on button pressed
        if (!URL.getRoutes().has(routeId))
            URL.addRoute(routeId);
        else 
            URL.removeRoute(routeId);
        
      
        Routes.refresh();
        Vehicles.refresh();
      }}>
        {text}
      </MenuItemOption> 
    )
}