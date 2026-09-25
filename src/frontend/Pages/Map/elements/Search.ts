import L from "leaflet";
import Stop from "./Stop";
import InfoWindowElement from "./abstracts/InfoWindowElement";

class Search extends InfoWindowElement {
    /* Public */
    constructor(searchId: string, name: string | undefined, location: L.LatLng, map: L.Map) {
        super(searchId, map, L.marker(location, { icon: SEARCH_PIN }).addTo(map), [0, -34]);

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

/** Drawn pin, since Leaflet's default marker image doesn't survive bundling */
const SEARCH_PIN = L.divIcon({
    className: "",
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    html: `<svg width="28" height="38" viewBox="0 0 28 38"><path d="M14 1C7 1 1.5 6.5 1.5 13.5 1.5 23 14 37 14 37s12.5-14 12.5-23.5C26.5 6.5 21 1 14 1z" fill="#7a0019" stroke="#fff" stroke-width="2"/><circle cx="14" cy="13.5" r="5" fill="#ffcc33"/></svg>`,
});

export default Search;