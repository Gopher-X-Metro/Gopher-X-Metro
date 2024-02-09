import customBusIcon from "../../img/bus.png";

// The Vehicle Class
class Vehicle {
    constructor (id: string, route: string, color : string, location: google.maps.LatLng, map: google.maps.Map) {
        this.id = id
        this.route = route
        this.marker = new window.google.maps.Marker({
            map: map,
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
    }

    public getRoute() : string { return this.route; }
    
    public getMarker() : google.maps.Marker { return this.marker; }
    
    private id: string;
    private route: string;
    private marker: google.maps.Marker;
}

export default Vehicle;