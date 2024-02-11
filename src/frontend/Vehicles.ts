import URL from "../backend/URL.ts";
import Data from "../backend/Data.ts";
import Routes from "./Routes.ts";

namespace Vehicles {
    // Sets the map the vehicles appear on
    export function setMap(_map: google.maps.Map) { map = _map; }

    // Refreshes the Vehicles, Calls the Data.getRealtimeGTFS
    export function refresh() {
        // Updates Vehicles
        URL.getRoutes()?.forEach(routeId => {
            // Fetches data for the route
            Data.getRealtimeGTFS(routeId).then(response => {
                if (Object.keys(Data.UNIVERSITY_ROUTES).indexOf(routeId) === -1) {

                    // Operate on the data of the vehilces not part of the University
                    response.entity.forEach(entity => {
                        if (entity.vehicle.trip.routeId === routeId) {
                            if (entity.vehicle.timestamp !== 0) {
                                updateVehicle(routeId, entity.vehicle.vehicle.id, new google.maps.LatLng(entity.vehicle.position.latitude, entity.vehicle.position.longitude))
                            }
                        }
                    });

                } else {

                    // Operate on the data of vehicles that are part of the University
                    response.vehicles.forEach(vehicle => {
                        if (Data.UNIVERSITY_ROUTES[routeId] === vehicle.routeID) { 
                            updateVehicle(routeId, vehicle.vehicleID, new google.maps.LatLng(vehicle.lat, vehicle.lng)) 
                        }
                    });

                }
            })

        })
    } 

    let map : google.maps.Map;

    // Updates the current list of vehicles
    function updateVehicle(routeId: string, vehicleId: string, location: google.maps.LatLng) {
        // Find the vehicle
        const vehicle = Routes.getRoute(routeId)?.getVehicles()?.get(vehicleId);
        
        // Check if the vehicle exists
        if (vehicle === undefined) {
            // If the vehicle did not exist, make a new one
            Routes.getRoute(routeId)?.addVehicle(routeId, vehicleId, "#000000", location, map);
        } else {
            // If the id exists, modify the vehicle
            vehicle.getMarker().setPosition(location);

            // When the user hovers over the marker, make route thicker
            vehicle.getMarker().addListener("mouseover", () => Routes.setBolded(routeId, true));

            // When the user stops hovering over the marker, return back
            vehicle.getMarker().addListener("mouseout", () => Routes.setBolded(routeId, false));
        }
    }
}

export default Vehicles;