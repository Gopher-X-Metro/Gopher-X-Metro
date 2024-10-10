/** Builds the data objects */
export default abstract class _DataAbstract {
    /**
     * Constructor for _DataAbstract class
     * @param id    id of the data object
     */
    constructor(id: unknown) {
        this.id = id;
    }
    
    /** Id of the data object */
    public readonly id: unknown;
}