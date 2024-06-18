export default class InfoWindow {
    /* Public */

    /**
     * InfoWindow Constructor
     * @param routeId   route ID the InfoWindow belongs to
     * @param location  location of the InfoWindow
     * @param map       map the InfoWindow displays on
     */
    constructor(routeId: string, location: google.maps.LatLng | undefined, map: google.maps.Map) {
        this.routeId = routeId;
        this.location = location;
        this.map = map;
        
        // this.window = new window.google.maps.InfoWindow({
        //     maxWidth: 200, // Set the maximum width of the info window
        //     //maxHeight: 200, // Set the maximum height of the info window
        // });

        this.window = new window.google.maps.InfoWindow();
        
        this.window.setPosition(location);
    }   
    
    /**
     * Changes the content of the info window on the map
     */
    public setContent(content: string) {
        this.window.setContent(content);
    }
    /**
     * Closes the info window on the map
     */
    public close() {
        if (this.window) this.window.close();
    }
    /**
     * Opens the info window on the map
     */
    public open() {
        if (this.window) this.window.open(this.map);
    }
    /**
     * If the info window is displaying on the map
     */
    public isOpen() {
        return this.window.get("map") != null;
    }
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

    protected routeId: string;
    protected location: google.maps.LatLng | undefined;
    protected window: google.maps.InfoWindow;
    protected map: google.maps.Map;
}