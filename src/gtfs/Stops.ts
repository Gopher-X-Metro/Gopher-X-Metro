class Stop {
    id: string;
    route: string;

    marker: google.maps.Circle;

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

    setVisible(visible: boolean) { this.marker.setVisible(visible) }
}


class Stops {
    stops: Map<string, Stop>;

    constructor() {
        this.stops = new Map<string, Stop>();
    }

    addStop(id: string, route: string, color: string, location: google.maps.LatLng, map: google.maps.Map) {
        this.stops.set(id, new Stop(id, route, color, location, map))
    }

    forEach(callbackfn: (value: Stop, key: string, array: Map<string, Stop>) => void) { return this.stops.forEach(callbackfn); }    

}

export default Stops