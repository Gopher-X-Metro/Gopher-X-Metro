import Realtime from "../../backend/Realtime";
import _DataAbstract from "./_DataAbstract";
import Data from "../Data";

export default class _Direction extends _DataAbstract {
    constructor(directionId: number, routeId: string) {
        super(directionId);
        this.routeId = routeId;

        this.places = new Map<string, Promise<Data.Place>>();
    }

    public async reload() {
        this.places.clear();
        await Realtime.getStops(this.routeId, this.getId() as number).then(response => {
            for (const place of response)
                this.places.set(place.place_code, Data.Place.create(place.place_code, this.getId() as number, this.routeId, place.description))
        })
    }
    
    public readonly places: Map<string, Promise<Data.Place>>;

    private readonly routeId: string;
}