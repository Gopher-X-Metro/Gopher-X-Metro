import React, {useEffect, useState} from "react";

import URL from "src/backend/URL.ts";
import Routes from "src/frontend/Pages/Map/components/Routes";

/**
 * RouteButton Component
 * 
 * Creates a route button with route that the button leads to
 * @param routeId ID of route
 * @param text display text of button
 * @returns rendered RouteButton component
 */
function RouteButton({ routeId, text }) {
  // State to track if route is selected
  const [isActive, setActive] = useState(false);

  // Removes info windows for all stops on route associated with given routeId
  const removeInfoWindows = () => {
    // Get all stops associated with routeId
    const stops = Routes.getRoute(routeId)?.getStops();
    // Iterate over stops and close their info windows if they exist
    stops?.forEach(stop => { stop.infoWindow?.setVisible(false); });
  };

  // Effect to set button's active state based on whether route is active
  useEffect(() => {
    // Update button state when route state changes
    const updateButtonState = () => setActive(URL.getRoutes().has(routeId));
    
    // Add listener to update button state when route state changes
    URL.addListener(updateButtonState);
    
    // Initial check if route is active
    updateButtonState();

    // Cleanup listener when component is unclicked
    return () => {
      URL.removeListener(updateButtonState);
    };
  }, [routeId]);

  // Create button element with dynamic classes based on route's active state
  const buttonElement = React.createElement("button", {
    className: `route-btn ${isActive ? 'active' : ''} route-${routeId}`, onClick: () => {
      // Toggle route's visibility when button is clicked
      if (!isActive) {
        URL.addRoute(routeId);
      } else {
        URL.removeRoute(routeId);
      }

      // Remove info windows associated with route
      removeInfoWindows();
    }
  }, text);

  return buttonElement;
}

export default RouteButton;