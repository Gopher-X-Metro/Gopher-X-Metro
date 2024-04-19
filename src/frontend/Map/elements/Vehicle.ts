import Element from "./Element.ts";
import { transit_realtime } from "gtfs-realtime-bindings";


class Vehicle extends Element {

    /* Public */

    /**
     * Vehicle Constructor
     * @param vehicleId vehicle ID
     * @param tripId 
     * @param color color of vehicle image
     * @param map map the vehicle displays on
     */
    constructor (vehicleId: string, color : string, map: google.maps.Map, images: string[2]) {
        super(vehicleId, color, map);

        const content = document.createElement("div");

        const busImage = document.createElement("img")
        busImage.src = images[0];
        busImage.width = 30;
        content.appendChild(busImage);

        const arrowImage = document.createElement("img")
        arrowImage.src = images[1];
        arrowImage.width = 10;
        content.appendChild(arrowImage);

        this.marker = new window.google.maps.marker.AdvancedMarkerElement({
            map: map,
            content: busImage,
        })
    }
    /**
     * Gets the length in ms of the time between when position was updated and now
     */
    public getLastUpdated() : number | undefined {
        if (this.timestamp)
            return (Date.now()/1000) - this.timestamp; 
    }
    /**
     * Gets the stopTimeUpdates array for the vehicle
     */
    public getStopTimeUpdates() : transit_realtime.TripUpdate.IStopTimeUpdate[] | undefined | null {return this.stopTimeUpdates; }
    /**
     * Get the trip ID
     */
    public getTripId() : string { return this.tripId; }
    /**
     * Get the marker object of this vehicle on the map
     */
    public getMarker() : google.maps.marker.AdvancedMarkerElement { return this.marker; }
    /**
     * Sets the stopTimeUpdates array for the vehicle 
     * @param stopTimeUpdates stopTimeUpdates array
     */
    public setStopTimeUpdates(stopTimeUpdates : transit_realtime.TripUpdate.IStopTimeUpdate[] | undefined | null) : void {this.stopTimeUpdates = stopTimeUpdates}
    /**
     * Sets the trip ID
     * @param tripId trip ID
     */
    public setTripId(tripId : string) : void { this.tripId = tripId; }
    /**
     * Sets the position of the vehicle on the map
     * @param position position of the vehicle
     * @param timestamp when this position was updated
     */
    public setPosition(position : google.maps.LatLng, timestamp : number) : void {
        if (!(this.getMarker().position?.toString() === position.toString())) {
            this.getMarker().position = position;
            this.timestamp = timestamp;
        }
    }

    public getBusBearing(): number { return this.bearing; }

    public setBusBearing(bearing: number): void {
        this.bearing = bearing;
        // console.log("Setting Bearing to: ", bearing);
    } 
    
    /* Private */
    private tripId: string;
    private timestamp : number;
    private marker: google.maps.marker.AdvancedMarkerElement;
    private stopTimeUpdates: transit_realtime.TripUpdate.IStopTimeUpdate[] | undefined | null;
    private bearing: number;
}

export default Vehicle;