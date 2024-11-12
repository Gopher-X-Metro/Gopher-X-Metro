import Element from "src/frontend/Pages/Map/elements/abstracts/Element";
import InfoWindow from "src/frontend/Pages/Map/components/InfoWindow";

/**
 * Info Window element 
 * @abstract
 */
abstract class InfoWindowElement extends Element {
    public readonly infoWindow: InfoWindow | undefined;

    /**
     * Constructor for the InfoElement class
     * @param id ID of element
     * @param map map the element appears on
     * @param marker marker the element represents
     */
    constructor(id: string, map: google.maps.Map, marker: google.maps.MVCObject | google.maps.marker.AdvancedMarkerElement) {
        super(id, map, marker);

        if (this.marker instanceof google.maps.MVCObject) {
            this.infoWindow = new InfoWindow(this.marker.get("center"), map);
        } else if (this.marker instanceof google.maps.marker.AdvancedMarkerElement) {
            this.infoWindow = new InfoWindow(this.marker.position as google.maps.LatLng, map);
        }

        this.marker.addListener("click", () => {
            this.infoWindow?.setVisible(!this.infoWindow?.isVisible())
        });
    }

    /**
     * Updates the info window information
     */
    abstract updateWindow() : void;

    /* Depreciated / Unused */

    /**
     * Updates info window information
     * @deprecated
     */
    private updateInfoWindow() : void { 
        this.updateWindow(); 
    }
}

export default InfoWindowElement;