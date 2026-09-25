import L from "leaflet";

abstract class Primative {
    /**
     * Constructor for the Primative class
     * @param id   id of the primative object
     * @param map   map of the primative object
     */
    constructor (id: string, map: L.Map) {
        this.id = id;
        this.map = map;
    }

    /**
     * Gets the id
     */
    public getId() : string { return this.id; }
    /**
     * Tells if the primative is visible
     */
    abstract isVisible() : boolean;

    protected readonly id: string;
    protected readonly map: L.Map;
}

export default Primative;
