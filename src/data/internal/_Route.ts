import _DataAbstract from "./_DataAbstract";
import Realtime from "../../backend/Realtime";
import Data from "../Data";

export default class _Route extends _DataAbstract {
    constructor(routeId: string) {
        super(routeId);

        this.visible = true;
        this.directions = new Map<number, Promise<Data.Direction>>();     
    }
    
    public setVisible(visible: boolean) : void { this.visible = visible; }
    public isVisible() : boolean { return this.visible; }

    static async create(routeId: string) : Promise<Data.Route> {
        const route = new Data.Route(routeId);

        for (const direction of await Realtime.getDirections(routeId)) {
            route.directions.set(
                direction.direction_id, 
                Data.Direction.create(
                    direction.direction_id,
                    routeId
                )
            );
        }
        
        return route;
    }

    public readonly directions: Map<number, Promise<Data.Direction>>;

    private visible: boolean;
}