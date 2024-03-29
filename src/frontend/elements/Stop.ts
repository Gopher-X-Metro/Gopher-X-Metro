import { Circle } from "@chakra-ui/react";
import Resources from "../../backend/Resources.ts";
class Stop {

    /* Public */

    /**
     * Stop Constructor
     * @param routeId route ID the stop belongs to
     * @param stopId ID of the stop
     * @param color color of the stop
     * @param location location of the stop
     * @param map map the stop displays on
     */
    constructor(routeId: string, stopId: string, color: string, location: google.maps.LatLng, map: google.maps.Map) {
        this.stopId = stopId;
        this.routeId = routeId
        this.location = location;
        this.stopTimes = new Map<string, string | undefined>();
        const Circle_color = Resources.getColor(this.routeId);
        //const tripIDs = Resources.getTripIds(this.routeId);
        //const stopIDs = Resources.getStopIds(tripIDs[0]);
        //const stopTimes = Resources.getStopTimes(stopId);
        //this.stopTimes = stopTimes;
        //const Resources.getStopTimes(tripIDs);
        this.marker = new window.google.maps.Circle({
            //fillColor: Circle_color,
            fillOpacity: 100,
            strokeWeight: 10,
            strokeColor: Circle_color,
            center: this.location,
            radius: 5,
            clickable: true,
            map: map
        });
        const contentString = "Route ID: " + this.routeId;
        
        const infoWindow = new window.google.maps.InfoWindow({
            ariaLabel: contentString,
            content: contentString,
            maxWidth: 200, // Set the maximum width of the info window
            //maxHeight: 200, // Set the maximum height of the info window
        });
        infoWindow.setPosition(location);
        let infoWindowOpen = false; // Flag to indicate whether the info window is open
        this.marker.addListener('click', () => {
            //console.log(stopTimes);
            if (infoWindowOpen) {
                infoWindow.close();
                infoWindowOpen = false; // Set flag to indicate info window is closed
            } else {
                infoWindow.open(map, this.marker);
                infoWindowOpen = true; // Set flag to indicate info window is open
            }
            // Calculate the pixel offset to position the info window above the marker
            const markerPosition = location;
            const pixelOffset = new window.google.maps.Size(0, -20); // Adjust the Y offset as needed

            // Open the info window at the clicked marker's position with custom options
            infoWindow.setOptions({
                position: markerPosition,
                pixelOffset: pixelOffset,
            });
        });
        this.infoWindow = infoWindow; // jesus
    }
    /**
     * Closes the info window on the map
     */
    public closeInfoWindow() {
        if(this.infoWindow) {
            this.infoWindow.close();
        }
    }
    /**
     * Gets the info window object on the map
     */
    public getInfoWindow() : google.maps.InfoWindow { return this.infoWindow; }
    /**
     * Gets the marker object on the map
     */
    public getMarker() : google.maps.Circle { return this.marker; }
    /**
     * Gets the ID of the stop
     */
    public getStopId() : string { return this.stopId; }
    /**
     * Gets the stop times hash
     */
    public getStopTimes() : Map<string, string | undefined> { return this.stopTimes; }
    /**
     * Adds a stop time to the stop times hash
     * @param vehicleId id of the vehicle
     * @param time time of the stop
     */
    public addStopTime(vehicleId: string, time: string | undefined) { this.stopTimes.set(vehicleId, time); }

    /* Private */

    private stopId: string;
    private routeId: string;
    private stopTimes: Map<string, string | undefined>;
    private location: google.maps.LatLng;
    private marker: google.maps.Circle;
}

export default Stop;