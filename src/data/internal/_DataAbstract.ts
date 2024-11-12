/**
 * Builds the data objects
 * @abstract
 */
export default abstract class _DataAbstract {
    /** Id of data object */
    public readonly id: unknown;

    /**
     * Constructor for _DataAbstract class
     * @param id id of data object
     */
    constructor(id: unknown) {
        this.id = id;
    }
}