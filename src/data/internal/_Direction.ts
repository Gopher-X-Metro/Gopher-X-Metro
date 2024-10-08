import _DataAbstract from "./_DataAbstract";
import Realtime from "src/backend/Realtime";
import Data from "../Data";

export default class _Direction extends _DataAbstract {
    constructor(directionId: number, routeId: string) {
        super(directionId);
        this.routeId = routeId;

        this.places = new Map<string, Promise<Data.Place>>();
    }

    public async load() {
        this.places.clear();

        await Realtime.getStops(this.routeId, this.id as number).then(response => {
            for (const place of response)
                this.places.set(place.place_code, Data.Place.create(place.place_code, this.id as number, this.routeId, place.description));
        })
    }

    public readonly places: Map<string, Promise<Data.Place>>;

    private readonly routeId: string;
}