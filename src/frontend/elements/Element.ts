/**
 * Builds Map Elements
 */
abstract class Element {
    /* Public */

    /**
     * Element Constructor
     * @param Id ID of the element
     * @param color color of the element
     * @param map map the element displays on 
     */
    constructor(Id: string, color: string, map: google.maps.Map) {
        this.Id = Id;
        this.color = color;
        this.map = map;
    }
    /**
     * Gets the Element's Color
     */
    public getColor() : string { return this.color; }
    /**
     * Gets the Element's ID
     */
    public getId() : string { return this.Id; }

    /* Private */

    private readonly Id: string;
    private readonly color: string;
    protected readonly map: google.maps.Map;
}

export default Element;