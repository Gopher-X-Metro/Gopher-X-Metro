/**
 * Primitive parent abstract class
 * @abstract
 */
abstract class Primative {
    protected readonly id: string;
    protected readonly map: google.maps.Map;
    
    /**
     * Constructor for Primative class
     * @param id id of primative object
     * @param map map of primative object
     */
    constructor (id: string, map: google.maps.Map) {
        this.id = id;
        this.map = map;
    }

    /**
     * Gets id
     * @returns string id
     */
    public getId() : string { 
        return this.id; 
    }

    /**
     * Tells if the primative is visible
     */
    abstract isVisible() : boolean;
}

export default Primative;