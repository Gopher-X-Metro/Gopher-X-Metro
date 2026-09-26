import React, {useEffect, useState} from 'react';

import URL from 'src/backend/URL.ts';
import Routes from 'src/frontend/Pages/Map/components/Routes';
import Realtime from 'src/backend/Realtime.ts';

/**
 * Creates a route button with the route that the button leads to and the route that it leads to
 * @param routeId ID of the route
 * @param text Display text of the button
 * @returns 
 */
function RouteButton({ routeId, text }: { routeId: string, text?: string }) {
  useEffect(() => {
    // updates color of button click immediately
    URL.addListener(() => setActive(URL.getRoutes().has(routeId)))
    setActive(URL.getRoutes().has(routeId));
  }, [])

  const [isActive, setActive] = useState(false);
  const [isRunning, setRunning] = useState(true);

  useEffect(() => {
    let schedule: Promise<any> | undefined;
    const check = async () => {
      schedule ??= fetch(process.env.PUBLIC_URL + "/gtfs/schedules/" + routeId + ".json")
        .then(response => response.ok && response.headers.get("content-type")?.includes("json") ? response.json() : null)
        .catch(() => null);
      const [spans, vehicles] = await Promise.all([schedule, Realtime.getVehicles(routeId).catch(() => undefined)]);
      setRunning(inServiceWindow(await spans) || (vehicles?.length ?? 0) > 0);
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [routeId])

  const removeInfoWindows = () => {
    // Get all markers associated with the routeId
    const stops = Routes.getRoute(routeId)?.getStops();
    // Iterate over markers and close their info windows
    stops?.forEach(stop => { stop.infoWindow?.setVisible(false); });
  };

  const buttonElement = React.createElement("button", {
    className: `route-btn ${isActive ? 'active' : undefined} ${isRunning ? '' : 'inactive'} route-${routeId}`,
    title: isRunning ? undefined : "Not running right now",
    onClick: () => {
      // selects specific route depending on button pressed
      if (!isActive)
        URL.addRoute(routeId);
      else
        URL.removeRoute(routeId);

      // Remove info windows associated with the routeId
      removeInfoWindows();
    }
  }, text, isRunning ? null : React.createElement("span", { className: "not-running" }, "not running"));

  return buttonElement;
}

const DAYS = ["Sunday", "Weekday", "Weekday", "Weekday", "Weekday", "Weekday", "Saturday"];

/**
 * Whether the current time falls in any of the route's scheduled spans (seconds since midnight, may pass 24h)
 * @param schedule the route's generated schedule file, or null if it has none
 */
function inServiceWindow(schedule: Record<string, Array<{ spans: Array<[number, number, number]> }>> | null) : boolean {
  if (!schedule) return false;
  const now = new Date();
  const seconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const inDay = (day: number, time: number) =>
    (schedule[DAYS[day]] ?? []).some(direction => direction.spans.some(([start, end]) => start <= time && time <= end));
  // Late-night trips are listed past midnight under the previous service day
  return inDay(now.getDay(), seconds) || inDay((now.getDay() + 6) % 7, seconds + 86400);
}

export default RouteButton;
