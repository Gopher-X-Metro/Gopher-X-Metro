import InfoWindow from "./InfoWindow";
import Element from './Element';

class InfoWindowElement extends InfoWindow {
    /* Public */
    
    constructor(element: google.maps.MVCObject | google.maps.marker.AdvancedMarkerElement, location: google.maps.LatLng | undefined, map: google.maps.Map) {
        super(location, map);
        this.element = element;
        this.element.addListener("click", () => {
            if (this.isOpen())
                this.close();
            else
                this.open();
        })
    }

    /* Private */

    protected element: google.maps.MVCObject | google.maps.marker.AdvancedMarkerElement;
}

export default InfoWindowElement;