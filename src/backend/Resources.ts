import Data from "./Data.ts";

namespace Resources {
    export const tripsFileHash = new Map<string, [Set<string>, Set<string>]>();
    export const shapesFileHash = new Map<string, Set<google.maps.LatLng>>();
    export const routesFileHash = new Map<string, string>();
    export const stopTimesFileHash = new Map<string, Set<string>>();
    export const stopsFileHash = new Map<string, google.maps.LatLng>();

    export async function load() {
        console.log("Loading Resources...")
        
        await Data.load();
        
        console.log("Finished Loading Resources")
    }

    export function getShapeIds(routeId: string) : Set<string> {
        let ids = new Set<string>();

        Data.getHash("trips.txt").get(routeId)?.forEach(line => ids.add(line.split(/,/)[7]))

        return ids;
    }

    export function getTripIds(routeId: string) : Set<string> {
        let ids = new Set<string>();

        Data.getHash("trips.txt").get(routeId)?.forEach(line => ids.add(line.split(/,/)[2]))
        
        return ids;
    }

    export function getStopIds(tripId: string) : Set<string> {
        let ids = new Set<string>();

        Data.getHash("stop_times.txt").get(tripId)?.forEach(line => ids.add(line.split(/,/)[3]) )

        return ids;
    }

    export function getShapeLocations(shapeId: string) : Array<google.maps.LatLng> {
        let shape = new Array<google.maps.LatLng>();

        Data.getHash("shapes.txt").get(shapeId)?.forEach(line =>{
            const sections = line.split(/,/);
            shape.push(new google.maps.LatLng(Number(sections[1]), Number(sections[2])))
        })

        return shape;
    }

    export function getStopLocation(stopId: string) : google.maps.LatLng {
        let stop : google.maps.LatLng;

        Data.getHash("stops.txt").get(stopId)?.forEach(line => {
            const sections = line.split(/,/);
            stop = new google.maps.LatLng(Number(sections[4]), Number(sections[5]))
        })

        //@ts-ignore
        return stop;
    }

    export function getStopTimes(tripId: string) : Map<string, Array<string | undefined>> {
        let stopTimes = new Map<string, Array<string | undefined>>();

        Data.getHash("stop_times.txt").get(tripId)?.forEach(line => {
            let sections = line.split(/,/);
            stopTimes.set(sections[3], [sections[4], sections[1], sections[2]])
        })

        return stopTimes;
    }

    export function getColor(routeId: string) : string {
        let color = "";
        
        Data.getHash("routes.txt").get(routeId)?.forEach(line => color += line.split(/,/)[7]);
        
        return color;
    }
}

export default Resources;