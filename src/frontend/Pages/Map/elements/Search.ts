import L from "leaflet";
import Stop from "./Stop";
import InfoWindowElement from "./abstracts/InfoWindowElement";

class Search extends InfoWindowElement {
    /* Public */
    constructor(searchId: string, name: string | undefined, location: L.LatLng, map: L.Map) {
        super(searchId, map, L.marker(location).addTo(map), [0, -30]);

        this.name = name;
        
        this.elements = new Set<Stop>();
        
        this.updateWindow();
    }

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
     * Adds an element to the elements set
     * @param element Element to add
     */
    public addElement(element: Stop) : void {
        this.elements.add(element);
    }
    /**
     * Sets this search element's visiblity
     * @param visible   if the elements should be visible
     * @override
     */
    public setVisible(visible: boolean): void {
        super.setVisible(visible);
        this.elements.forEach(element => element.updateVisibility());
    }

    /* Private */
    private name: string | undefined;
    private elements: Set<Stop>;
}

export default Search;