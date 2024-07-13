export default class InfoWindow {
    /* Public */

    /**
     * InfoWindow Constructor
     * @param location  location of the InfoWindow
     * @param map       map the InfoWindow displays on
     */
    constructor(location: google.maps.LatLng | undefined, map: google.maps.Map) {
        this.location = location;
        this.map = map;
        
        this.window = new window.google.maps.InfoWindow();
        
        this.window.setPosition(location);
    }   
    /**
     * Changes the content of the info window on the map
     */
    public setContent(content: string | Element | null | Text) {
        this.window.setContent(content);
    }
    /**
     * Sets the visibility of the info window
     */
    public setVisible(visible: boolean) : void {
        if (visible)
            this.window.open(this.map);
        else
            this.window.close();
    }
    /**
     * If the info window is displaying on the map
     */ 
    public isVisible() : boolean { return this.window.get("map") != null; }
    /**
     * Gets the info window object on the map
     */
    public getWindow() : google.maps.InfoWindow { 
        return this.window; 
    }
    /**
     * Sets the position of the info window on the map
     */
    public setPosition(location: google.maps.LatLng) { 
        this.window.setPosition(location);
    }

    /* Private */

    protected location: google.maps.LatLng | undefined;
    protected window: google.maps.InfoWindow;
    protected map: google.maps.Map;

    /* Depreciated */

    /**
     * Closes the info window on the map
     * @deprecated
     */
    public close() {
        if (this.window) this.window.close();
    }
    /**
     * Opens the info window on the map
     * @deprecated
     */
    public open() {
        if (this.window) this.window.open(this.map);
    }
    /**
     * If the info window is displaying on the map
     * @deprecated
     */
    public isOpen() {
        return this.window.get("map") != null;
    }
}