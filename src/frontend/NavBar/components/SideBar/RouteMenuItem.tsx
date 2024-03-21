import React from "react";
import URL from '../../../../backend/URL.ts';
import Routes from '../../../Routes.ts';
import Vehicles from '../../../Vehicles.ts';

import { 
    MenuItemOption,
    Icon
} from '@chakra-ui/react'
import { AddIcon } from "@chakra-ui/icons";


/**
 * Creates a route button with the route that the button leads to and the route that it leads to
 * @param routeId ID of the route
 * @param text Display text of the button
 * @returns 
 */
export default function RouteMenuItem({routeId, text}) {

  let color = '';

  switch(routeId) {
    case '121':
      color = "#FF0000";
      break;
    case '122':
      color = "#800080";
      break;
    case '123':
      color = "#00FFFF"
      break;
    case '124':
      color = "#90EE90"
      break;
    case '120':
      color = "#FFC0CB"
      break;
    case '2':
      color = "#bab832"
      break;
    case '6':
      color = "#236918"
      break
    case '3':
      color = "#d18528"
      break;
    case '902':
      color = "#00843D"
      break;
    case '901':
      color = "#003DA5"
      break;
      
  }

  const removeInfoWindows = () => {
    // Get all markers associated with the routeId
    //const markers = URL.getRoutes();
    //const Routes = markers.forEach(marker => {Routes.getRoute(marker)});
    const stops = Routes.getRoute(routeId)?.getStops();
    //console.log(stops.forEach(stop => {console.log(stop.getInfoWindow())}));
    // Iterate over markers and close their info windows
    stops.forEach(stop => {
        const infoWindow = stop.getInfoWindow();
        if (infoWindow){
            infoWindow.close();
        }
            
    });
};

  return (
    <MenuItemOption value={routeId} color={color} onClick={() => {
      // selects specific route depending on button pressed
      if (!URL.getRoutes().has(routeId))
          URL.addRoute(routeId);
      else 
          URL.removeRoute(routeId);
      
    
      Routes.refresh();
      Vehicles.refresh();

      // Remove info windows associated with the routeId
      removeInfoWindows();
    }}>
      {text}
    </MenuItemOption> 
  )
}