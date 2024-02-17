import URL from "../backend/URL.ts";
import Data from "../backend/Data.ts";
import Routes from "./Routes.ts";
import Resources from "../backend/Resources.ts";
import { transit_realtime } from "gtfs-realtime-bindings";

namespace Vehicles {
    // Sets the map the vehicles appear on
    export function setMap(_map: google.maps.Map) { map = _map; }

    // Refreshes the Vehicles, Calls the Data.getRealtimeGTFS
    export async function refresh() {
        // Updates Vehicles
        URL.getRoutes()?.forEach(async routeId => {
            if (Object.keys(Resources.UNIVERSITY_ROUTES).indexOf(routeId) === -1) {
                // Operate on the data of the vehilces not part of the University
                const tripUpdates = await Data.getRealtimeGTFSTripUpdates();
                const vehiclePositions =  await Data.getRealtimeGTFSVehiclePositions();
    
                // Goes through each vehicle in the route
                vehiclePositions.entity.forEach(entity => {
                    if (entity.vehicle?.trip?.routeId === routeId){   
                        // Goes through each trip update and gets the stop information                     
                        tripUpdates.entity.forEach(update => {
                            if (update.tripUpdate?.trip.tripId === entity.vehicle?.trip?.tripId)
                                updateVehicle(routeId, 
                                entity.vehicle?.vehicle?.id, 
                                entity.vehicle?.trip?.tripId, 
                                entity.vehicle?.timestamp as number, 
                                new google.maps.LatLng(entity.vehicle?.position?.latitude as number, entity.vehicle?.position?.longitude as number), 
                                update.tripUpdate?.stopTimeUpdate);
                        })
                    }
                })
            } else {
                // Operate on the data of vehicles that are part of the University
                Data.getRealtimeGTFSUniversity().then(response => response.vehicles.forEach(vehicle => { 
                    if (Resources.UNIVERSITY_ROUTES[routeId] === vehicle.routeID) 
                        updateVehicle(routeId, vehicle.vehicleID, "", 0, new google.maps.LatLng(vehicle.lat, vehicle.lng), []) 
                }));
            }
        })

        // Update stop times
        URL.getRoutes().forEach(routeId => {
            const route = Routes.getRoute(routeId);
            route?.getVehicles().forEach(vehicle => {
                Resources.getStopTimes(vehicle.getTripId()).forEach((value, key) => {
                    route.getStops().get(key)?.addStopTime(vehicle.getVehicleId(), value[1]);
                })
            })
        })
    } 

    let map : google.maps.Map;

    // Updates the current list of vehicles
    function updateVehicle(
        routeId: string, 
        vehicleId: string | null | undefined, 
        tripId: string | null | undefined, 
        timestamp: number | null | undefined, 
        location: google.maps.LatLng,
        stopTimeUpdates: transit_realtime.TripUpdate.IStopTimeUpdate[] | undefined | null) {
        if (!vehicleId || !tripId || !timestamp) return;
        
        // Find the vehicle
        let vehicle = Routes.getRoute(routeId)?.getVehicles()?.get(vehicleId);
        
        // Check if the vehicle exists
        if (vehicle === undefined) {
            // If the vehicle did not exist, make a new one
            Routes.getRoute(routeId)?.addVehicle(routeId, vehicleId, tripId, "#000000", map);

            vehicle = Routes.getRoute(routeId)?.getVehicles()?.get(vehicleId);

            if (vehicle) {
                // Sets vehicle position
                vehicle.setPosition(location, timestamp);

                // Sets the latest stop times
                vehicle.setStopTimeUpdates(stopTimeUpdates);

                // When the user hovers over the marker, make route thicker
                vehicle.getMarker().addListener("mouseover", () => {
                    Routes.setBolded(routeId, true)

                    const lastUpdate = vehicle?.getStopTimeUpdates()?.at(0)
                    const nextArrival = new Date(((lastUpdate?.arrival?.time ? lastUpdate?.arrival?.time : lastUpdate?.departure?.time) as number) * 1000);
                    console.log(nextArrival.toTimeString());

                    Routes.getRoute(routeId)?.getStops().get(vehicle?.getStopTimeUpdates()?.at(0)?.stopId as string)?.getMarker().setRadius(100)
                });    

                // When the user stops hovering over the marker, return back
                vehicle.getMarker().addListener("mouseout", () => {
                    Routes.setBolded(routeId, false)

                    vehicle?.getStopTimeUpdates()?.forEach(stopTimeUpdate => {
                        Routes.getRoute(routeId)?.getStops().get(stopTimeUpdate.stopId as string)?.getMarker().setRadius(10);
                    })
                });
            }
        } else {
            // If the id exists, modify the vehicle
            vehicle.setPosition(location, timestamp);

            vehicle.setStopTimeUpdates(stopTimeUpdates);
            
            vehicle.setTripId(tripId);
        }
    }
}

export default Vehicles;