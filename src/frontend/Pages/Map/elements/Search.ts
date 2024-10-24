import Stop from "src/frontend/Pages/Map/elements/Stop";
import InfoWindowElement from "src/frontend/Pages/Map/elements/abstracts/InfoWindowElement";

class Search extends InfoWindowElement {
    private name: string | undefined;
    private elements: Set<Stop>;
    
    /**
     * Search Constructor
     * @param searchId ID of search
     * @param name name of search
     * @param location location of search
     * @param map map to display the search result
     */
    constructor(searchId: string, name: string | undefined, location: google.maps.LatLng, map: google.maps.Map) {
        super(searchId, map, new google.maps.marker.AdvancedMarkerElement({
            map: map,
            content: new window.google.maps.marker.PinElement({scale: 0.8}).element,
            position: location
        }));

        this.name = name;
        this.elements = new Set<Stop>();

        this.infoWindow?.getWindow().set("pixelOffset", new google.maps.Size(0, -15));
        this.updateWindow();
    }

    /**
     * Updates search window
     */
    public async updateWindow() : Promise<void> {
        const divElement = document.createElement("div");
        divElement.style.cssText = "text-align:center; font-family: Arial, sans-serif;";

        const nameElement = document.createElement("h2");
        nameElement.textContent = this.name as string;
        nameElement.style.cssText = "margin-bottom: 10px; font-weight: bold;";

        const buttonElement = document.createElement("button");
        buttonElement.textContent = "Remove";
        buttonElement.style.cssText = "width: 50px; height: 10px;";
        buttonElement.onclick = () => {
            this.setVisible(false);
            this.infoWindow?.setVisible(false);
        };
        
        divElement.appendChild(nameElement);
        divElement.appendChild(buttonElement);

        this.infoWindow?.setContent(divElement);
    }

    /**
     * Adds an element to elements set
     * @param element Element to add
     */
    public addElement(element: Stop) : void {
        this.elements.add(element);
    }

    /**
     * Sets this search element's visiblity
     * @param visible if elements should be visible
     * @override
     */
    public setVisible(visible: boolean): void {
        (this.marker as google.maps.marker.AdvancedMarkerElement).map = (visible ? this.map : undefined);
        this.elements.forEach(element => element.updateVisibility());
    }
}

export default Search;