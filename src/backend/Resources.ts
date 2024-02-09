import Data from "./Data.ts";

namespace Resources {
    export const tripsFileHash = new Map<string, [Set<string>, Set<string>]>();
    export const shapesFileHash = new Map<string, Set<google.maps.LatLng>>();
    export const routesFileHash = new Map<string, string>();
    export const stopTimesFileHash = new Map<string, Set<string>>();
    export const stopsFileHash = new Map<string, google.maps.LatLng>();

    export async function load() {
        console.log("Loading Resources...")

        await Data.getFiles().then(async files => {
            await files["trips.txt"].async("string").then(contents => {
                contents.split("\r\n").forEach(line => {
                    const splitLine = line.split(",");
                    if (!tripsFileHash.has(splitLine[0])) { tripsFileHash.set(splitLine[0], [new Set(), new Set()]) }
                    tripsFileHash.get(splitLine[0])?.[0].add(splitLine[2]) // Trip ID for Stops
                    tripsFileHash.get(splitLine[0])?.[1].add(splitLine[7]) // Shape ID for Paths
                })
            })
            
            await files["shapes.txt"].async("string").then(contents => {
                contents.split("\r\n").forEach(line => {
                    const splitLine = line.split(",");
                    if (!shapesFileHash.has(splitLine[0])) { shapesFileHash.set(splitLine[0], new Set()) }
                    shapesFileHash.get(splitLine[0])?.add(new google.maps.LatLng(Number(splitLine[1]), Number(splitLine[2])))
                })
            })

            await files["routes.txt"].async("string").then(contents => {
                contents.split("\r\n").forEach(line => {
                    const splitLine = line.split(",");

                    if (!routesFileHash.has(splitLine[0])) { routesFileHash.set(splitLine[0], splitLine[7]) }
                })
            })

            // await files["stop_times.txt"].async("string").then(contents => {
            //     contents.split("\r\n").forEach(line => {
            //         const splitLine = line.split(",");

            //         if (!stopTimesFileHash.has(splitLine[0])) { stopTimesFileHash.set(splitLine[0], new Set()) }

            //         stopTimesFileHash.get(splitLine[0])?.add(splitLine[3]);
            //     })
            // })

            // await files["stops.txt"].async("string").then(contents => {
            //     contents.split("\r\n").forEach(line => {
            //         const splitLine = line.split(",");

            //         if (!stopsFileHash.has(splitLine[0])) { stopsFileHash.set(splitLine[0], new google.maps.LatLng(Number(splitLine[4]), Number(splitLine[5]))) }
            //     })
            // })
        })
        
        console.log("Finished Loading Resources")
    }
}

export default Resources;