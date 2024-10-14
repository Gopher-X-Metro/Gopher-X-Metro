/** Builds the schedule objects */
export default abstract class _ScheduleAbstract {
    /**
     * Constructor for _ScheduleAbstract class
     * @param id    id of the schedule object
     */
    constructor(id: unknown) {
        this.id = id;
    }
    
    /** Id of the schedule object */
    public readonly id: unknown;
}