import Element from "./Element";

class InfoElement extends Element {

    constructor(id: string, map: google.maps.Map, marker: google.maps.MVCObject | google.maps.marker.AdvancedMarkerElement) {
        super(id, map, marker);

        this.window = new window.google.maps.InfoWindow();
        
        this.window.setPosition();
    }

    private readonly window;
}

export default InfoElement;