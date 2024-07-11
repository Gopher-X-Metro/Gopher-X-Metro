import Element from "../Element";
import SearchInfoWindow from "./SearchInfoWindow";

class Search extends Element {
    /* Public */
    constructor(searchId: string, name: string | undefined, location: google.maps.LatLng, map: google.maps.Map) {
        super(searchId, "", map);
        
        this.name = name;
        this.marker = new google.maps.marker.AdvancedMarkerElement({
            map: map,
            content: new window.google.maps.marker.PinElement({scale: 0.8}).element,
            position: location
        });
        
        this.elements = new Set<Element>();
        this.infoWindow = new SearchInfoWindow(this.marker, location, map);

        this.updateInfoWindow();
    }

    /**
     * Updates the info window information
     */
    public async updateInfoWindow() : Promise<void> {
        this.infoWindow.setContent(`<div style="text-align:center; font-family: Arial, sans-serif;">
            <h2 style="margin-bottom: 10px; font-weight: bold;">${this.name}</h2>
            <button style="width: 50px; height: 10px;"  onclick="this.remove();">Remove</button>
            </div>`)
    }
    /**
     * Adds an element to the elements set
     * @param element Element to add
     */
    public addElement(element: Element) : void {
        this.elements.add(element);
    }
    /**
     * Remove this search
     */
    public remove() : void {
        console.log("remove");
    }

    /* Private */
    private marker: google.maps.marker.AdvancedMarkerElement;
    private infoWindow: SearchInfoWindow;
    private name: string | undefined;
    private elements: Set<Element>;
}

export default Search;