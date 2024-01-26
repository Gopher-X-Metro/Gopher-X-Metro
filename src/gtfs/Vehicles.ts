import Data from './Data.ts';
import Routes from './Routes.ts';

import customBusIcon from "../img/bus.png";

// The Vehicle Class
class Vehicle {
    id: string;
    route: string;
    marker: google.maps.Marker;

    constructor (id: string, route: string, location: google.maps.LatLng) {
        let color = "#" + Routes.ROUTE_COLORS[route]

        color = "#000000"

        this.id = id
        this.route = route
        this.marker = new window.google.maps.Marker({
            position: location,
            // label: this.route,
            label: {
                text: this.route,
                color: color,
                fontWeight: "20px",
                // fontFamily: 'Neutraface Text',
                fontSize: "20px"
            },
            optimized: true,
            icon: {
                url: customBusIcon,
                scaledSize: new window.google.maps.Size(25, 25)            
            },
        })

        
        // When the user hovers over the marker, make route thicker
        this.marker.addListener("mouseover", () => Routes.getRoute(route)?.setBolded(true))

        // When the user stops hovering over the marker, return back
        this.marker.addListener("mouseout", () => Routes.getRoute(route)?.setBolded(false))
    }
}


namespace Vehicles {
    let list = new Array<Vehicle>()
    let map: google.maps.Map

    // Sets the map the vehicles appear on
    export function setMap(_map: google.maps.Map) { map = _map}

    // Updates the current list of vehicles
    function updateVehicle(route: string, id: string, location: google.maps.LatLng) {
        // Find the index of the vehicle
        const vehicleIndex = list.map(vehicle => vehicle.id).indexOf(id)

        // Check if the vehicle exists
        if (vehicleIndex === -1) {
            // If the id exists, modify the vehicle
            list.push(new Vehicle(id, route, location))
        } else {
            // If the vehicle did not exist, make a new one
            list[vehicleIndex].marker.setPosition(location)
        }
    }

    // Refreshes the Vehicles, Calls the Data.getRealtimeGTFS
    export function refresh() {
        // Enables or Disables Vehicles
        list.forEach(vehicle => {
            if (Routes.getURLRoutes()?.indexOf(vehicle.route) === -1) {
                vehicle.marker.setMap(null)
            } else {
                vehicle.marker.setMap(map)
            }
        })

        // Updates Vehicles
        Routes.getURLRoutes()?.forEach(route => {
            // Fetches data for the route
            Data.getRealtimeGTFS(route).then(response => {
                if (Object.keys(Routes.UNIVERSITY_ROUTES).indexOf(route) === -1) {
                    // Operate on the data of the vehilces not part of the University
                    response.entity.forEach(entity => {
                        if (entity.vehicle.trip.routeId === route) {
                            if (entity.vehicle.timestamp !== 0) {
                                updateVehicle(route, entity.vehicle.vehicle.id, new google.maps.LatLng(entity.vehicle.position.latitude, entity.vehicle.position.longitude))
                            }
                        }
                    });
                } else {
                    // Operate on the data of vehicles that are part of the University
                    response.vehicles.forEach(vehicle => {
                        if (Routes.UNIVERSITY_ROUTES[route] === vehicle.routeID) { 
                            updateVehicle(route, vehicle.vehicleID, new google.maps.LatLng(vehicle.lat, vehicle.lng)) 
                        }
                    });
                }
            })

        })
    }    
}


export default Vehicles