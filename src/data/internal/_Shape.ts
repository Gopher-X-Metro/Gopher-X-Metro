import _DataAbstract from "./_DataAbstract";
import haversine from "haversine";

export default class _Shape extends _DataAbstract {
    constructor(shapeId: string, points: Array<google.maps.LatLng>) {
        super(shapeId)

        this.points = points;
        this.distances = [0];

        points.forEach((point, index) => {
            this.distances.push(
                this.distances[index-1] + 
                haversine(
                    {latitude: points[index-1].lat(), longitude: points[index-1].lng()}, 
                    {latitude: point.lat(), longitude: point.lng()}, 
                    {unit: "meter"}
                )
            )
        })
    }

    public readonly points : Array<google.maps.LatLng>;
    public readonly distances : Array<number>;
}