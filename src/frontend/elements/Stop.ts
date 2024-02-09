class Stop {
    constructor(id: string, route: string, color: string, location: google.maps.LatLng, map: google.maps.Map) {
        this.id = id
        this.route = route
        this.marker = new window.google.maps.Circle({
            fillColor: color,
            fillOpacity: 0,
            strokeColor: color,
            center: location,
            radius: 5,
            clickable: false,
            map: map
        })
    }

    public getMarker() : google.maps.Circle { return this.marker; }

    private id: string;
    private route: string;
    private marker: google.maps.Circle;
}

export default Stop;