import Element from "./Element.ts";
import { transit_realtime } from "gtfs-realtime-bindings";
import customBusIcon from "../../img/bus.png";

class Vehicle extends Element {

    /* Public */

    /**
     * Vehicle Constructor
     * @param vehicleId vehicle ID
     * @param tripId 
     * @param color color of vehicle image
     * @param map map the vehicle displays on
     */
    constructor (vehicleId: string, color : string, map: google.maps.Map) {
        super(vehicleId, color, map);
        
        this.marker = new window.google.maps.Marker({
            map: map,
            optimized: true,
            icon: {
                url: customBusIcon,
                scaledSize: new window.google.maps.Size(25, 25)            
            },
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
    public getMarker() : google.maps.Marker { return this.marker; }
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
        if (!this.getMarker().getPosition()?.equals(position)) {
            this.getMarker().setPosition(position);
            this.timestamp = timestamp;
        }
    }
    
    /* Private */
    private tripId: string;
    private timestamp : number;
    private marker: google.maps.Marker;
    private stopTimeUpdates: transit_realtime.TripUpdate.IStopTimeUpdate[] | undefined | null;
}

export default Vehicle;