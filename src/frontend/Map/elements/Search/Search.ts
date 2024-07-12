import Element from "../Element";
import SearchInfoWindow from "./SearchInfoWindow";

class Search extends Element {
    /* Public */
    constructor(searchId: string, name: string | undefined, location: google.maps.LatLng, map: google.maps.Map) {
        super(searchId, map, new google.maps.marker.AdvancedMarkerElement({
            map: map,
            content: new window.google.maps.marker.PinElement({scale: 0.8}).element,
            position: location
        }));

        this.name = name;
        
        this.elements = new Set<Element>();
        this.infoWindow = new SearchInfoWindow(this.marker, location, map);

        this.updateInfoWindow();
    }

    /**
     * Updates the info window information
     */
    public async updateInfoWindow() : Promise<void> {
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
            this.infoWindow.close();
        };
        
        divElement.appendChild(nameElement);
        divElement.appendChild(buttonElement);

        this.infoWindow.setContent(divElement);
    }
    /**
     * Adds an element to the elements set
     * @param element Element to add
     */
    public addElement(element: Element) : void {
        this.elements.add(element);
    }
    public setVisible(visible: boolean): void {
        (this.marker as google.maps.marker.AdvancedMarkerElement).map = visible ? this.map : undefined;
        this.elements.forEach(element => element.setVisible(visible));
    }

    /* Private */
    private infoWindow: SearchInfoWindow;
    private name: string | undefined;
    private elements: Set<Element>;
}

export default Search;