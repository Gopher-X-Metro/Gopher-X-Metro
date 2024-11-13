import _DataAbstract from "./_DataAbstract";
import Resources from "src/backend/Resources";
import haversine from "haversine";

/**
 * Holds information and functions on a shape
 */
export default class _Shape extends _DataAbstract {
    /** Id of the route that contains this shape */
    public readonly routeId : string;
    /** Points of this shape that defines its shape */
    public readonly points : Array<google.maps.LatLng>;
    /** Distance of the shape as it is traversed in meters*/
    public readonly distances : Array<number>;
    
    /**
     * Constructor for _Shape class
     * @param shapeId id of shape
     * @param routeId id of route that contains this shape
     * @param points points of shape obtained from _Route
     */
    constructor(shapeId: string, routeId: string) {
        super(shapeId)

        this.routeId = routeId;
        this.distances = new Array<number>();
        this.points = new Array<google.maps.LatLng>();
    }

    /** Loads the points in this shape */
    public async load() {
        this.points.push(...(await Resources.getShapeLocations(this.id as string)));
        this.distances.push(0);

        // Convert points to distances
        this.points.slice(1).forEach((point, index) => {
            this.distances.push(
                this.distances[index] + 
                haversine(
                    {latitude: this.points[index].lat(), longitude: this.points[index].lng()}, 
                    {latitude: point.lat(), longitude: point.lng()}, 
                    {unit: "meter"}
                )
            )
        });
    }

    /**
     * Finds the nearest point on the path to the given point
     * @param point given point to look for
     * @returns an index of the point in the array and the point itself
     */
    public nearestPoint(point: google.maps.LatLng) : {point: google.maps.LatLng, index: number} {
        const calculated = this.points.map(p => haversine(
            {latitude: p.lat(), longitude: p.lng()}, 
            {latitude: point.lat(), longitude: point.lng()}
        ))

        const index = calculated.findIndex(value => value === Math.min(...calculated));

        return {point: this.points[index], index: index};
    }
}