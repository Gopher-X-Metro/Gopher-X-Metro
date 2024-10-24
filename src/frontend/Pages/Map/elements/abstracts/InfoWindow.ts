/**
 * Info Window component
 */
export default class InfoWindow {
    protected location: google.maps.LatLng | undefined;
    protected window: google.maps.InfoWindow;
    protected map: google.maps.Map;

    /**
     * InfoWindow Constructor
     * @param location location of the InfoWindow
     * @param map map the InfoWindow displays on
     */
    constructor(location: google.maps.LatLng | undefined, map: google.maps.Map) {
        this.location = location;
        this.map = map;
        this.window = new window.google.maps.InfoWindow();
        
        this.window.setPosition(location);
    }

    /**
     * Changes content of info window on the map
     */
    public setContent(content: string | Element | null | Text) : void {
        this.window.setContent(content);
    }

    /**
     * Sets visibility of info window
     */
    public setVisible(visible: boolean) : void {
        if (visible) {
            this.window.open(this.map);
        } else {
            this.window.close();
        }
    }

    /**
     * If info window is displaying on map
     * @returns boolean if visible
     */ 
    public isVisible() : boolean { 
        return this.window.get("map") != null; 
    }

    /**
     * Gets info window object on the map
     * @returns info window object
     */
    public getWindow() : google.maps.InfoWindow { 
        return this.window; 
    }

    /**
     * Sets position of info window on the map
     */
    public setPosition(location: google.maps.LatLng) : void { 
        this.window.setPosition(location);
    }

    /* Depreciated / Unused */

    /**
     * Closes info window on the map
     * @deprecated
     */
    private close() : void {
        if (this.window) {
            this.window.close();
        }
    }

    /**
     * Opens info window on the map
     * @deprecated
     */
    private open() : void {
        if (this.window) {
            this.window.open(this.map);
        }
    }

    /**
     * If info window is displaying on the map
     * @returns boolean if open
     * @deprecated
     */
    private isOpen() : boolean {
        return this.window.get("map") != null;
    }
}