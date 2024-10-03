import _DataAbstract from "./_DataAbstract";
import Data from "../Data";

export default class _Route extends _DataAbstract {
    constructor(routeId: string) {
        super(routeId);

        this.visible = true;
        this.directions = new Map<number, Promise<Data.Direction>>();
        this.vehicles = new Map<string, Promise<Data.Vehicle>>();
    }
    
    public readonly directions: Map<number, Promise<Data.Direction>>;
    public readonly vehicles: Map<string, Promise<Data.Vehicle>>;

    private visible: boolean;
}