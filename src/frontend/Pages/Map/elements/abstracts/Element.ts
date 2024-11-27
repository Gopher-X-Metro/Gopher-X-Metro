import Primative from "src/frontend/Pages/Map/elements/abstracts/Primative";

/**
 * Builds Map Elements
 * @abstract
 */
abstract class Element extends Primative {
    protected readonly marker: google.maps.MVCObject | google.maps.marker.AdvancedMarkerElement;
    
    /**
     * Element Constructor
     * @param id ID of the element
     * @param color color of the element
     * @param map map the element displays on 
     */
    constructor(id: string, map: google.maps.Map, marker: google.maps.MVCObject | google.maps.marker.AdvancedMarkerElement) {
        super(id, map);
        this.marker = marker;
    }

    /**
     * Gets marker object on the map
     * @returns marker object
     */
    public getMarker() : google.maps.MVCObject | google.maps.marker.AdvancedMarkerElement { 
        return this.marker; 
    }

    /**
     * Sets visibility of the marker
     * @param visible if marker should be visible
     */
    public setVisible(visible: boolean) : void {
        if (this.marker instanceof google.maps.MVCObject) {
            this.marker.set("map", visible ? this.map : undefined);
        } else if (this.marker instanceof google.maps.marker.AdvancedMarkerElement) {
            this.marker.map = visible ? this.map : undefined;
        }
    }

    /**
     * Tells if marker is visible
     * @returns boolean if visible
     */
    public isVisible() : boolean {
        if (this.marker instanceof google.maps.MVCObject) {
            return this.marker.get("map") !== undefined;
        } else if (this.marker instanceof google.maps.marker.AdvancedMarkerElement) {
            return this.marker.map !== undefined;
        }

        return false;
    }
}

export default Element;