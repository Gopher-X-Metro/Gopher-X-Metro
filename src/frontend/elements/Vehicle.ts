import { transit_realtime } from "gtfs-realtime-bindings";
import customBusIcon from "../../img/bus.png";

// The Vehicle Class
class Vehicle {
    constructor (routeId: string, vehicleId: string, tripId: string, color : string, map: google.maps.Map) {
        this.vehicleId = vehicleId
        this.routeId = routeId
        this.tripId = tripId;
        this.marker = new window.google.maps.Marker({
            map: map,
            label: {
                text: this.routeId,
                color: color,
                fontWeight: "20px",
                fontSize: "20px"
            },
            optimized: true,
            icon: {
                url: customBusIcon,
                scaledSize: new window.google.maps.Size(25, 25)            
            },
        })
    }

    public setTripId(tripId : string) : void { this.tripId = tripId; }

    public setPosition(position : google.maps.LatLng, timestamp : number) : void {
        if (!this.getMarker().getPosition()?.equals(position)) {
            this.getMarker().setPosition(position);
            this.timestamp = timestamp;
        }
    }

    public getLastUpdated() : number | undefined {
        if (this.timestamp)
            return (Date.now()/1000) - this.timestamp; 
    }

    public setStopTimeUpdates(stopTimeUpdates : transit_realtime.TripUpdate.IStopTimeUpdate[] | undefined | null) : void {this.stopTimeUpdates = stopTimeUpdates}
    public getStopTimeUpdates() : transit_realtime.TripUpdate.IStopTimeUpdate[] | undefined | null {return this.stopTimeUpdates; }


    public getVehicleId() : string {return this.vehicleId; }

    public getTripId() : string { return this.tripId; }

    public getRouteId() : string { return this.routeId; }
    
    public getMarker() : google.maps.Marker { return this.marker; }
    
    private vehicleId: string;
    private tripId: string;
    private timestamp : number;
    private routeId: string;
    private marker: google.maps.Marker;
    private stopTimeUpdates: transit_realtime.TripUpdate.IStopTimeUpdate[] | undefined | null;
}

export default Vehicle;