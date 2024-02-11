import customBusIcon from "../../img/bus.png";

// The Vehicle Class
class Vehicle {
    constructor (routeId: string, vehicleId: string, color : string, location: google.maps.LatLng, map: google.maps.Map) {
        this.vehicleId = vehicleId
        this.routeId = routeId
        this.marker = new window.google.maps.Marker({
            map: map,
            position: location,
            // label: this.route,
            label: {
                text: this.routeId,
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
    }

    public getRouteId() : string { return this.routeId; }
    
    public getMarker() : google.maps.Marker { return this.marker; }
    
    private vehicleId: string;
    private routeId: string;
    private marker: google.maps.Marker;
}

export default Vehicle;