export default abstract class _DataAbstract {
    constructor(id: unknown) {
        this.id = id;
    }
    
    public getId() : unknown { return this.id; }

    private id: unknown;
}