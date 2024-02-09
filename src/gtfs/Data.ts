import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import JSZip from "jszip";
import Routes from './Routes.ts';

namespace Data {
    const GTFS_STATIC_URL = "https://svc.metrotransit.org/mtgtfs/gtfs.zip";
    const GTFS_REALTIME_URL_UMN = "https://api.peaktransit.com/v5/index.php?app_id=_RIDER&key=c620b8fe5fdbd6107da8c8381f4345b4&controller=vehicles2&action=list&agencyID=88";
    const GTFS_REALTIME_URL_TRANSIT = 'https://svc.metrotransit.org/mtgtfs/vehiclepositions.pb';

    
    function test() {
        const tripsHash = new Map<Number, Array<string>>();
        const stopsHash = new Map<Number, Array<string>>();
        const stopTimesHash = new Map<string, Array<string>>();
        const routesHash = new Map<Number, Array<string>>();
        const shapesHash = new Map<Number, Array<string>>();


        fetch(GTFS_STATIC_URL).then(response => {     
            if (response.ok) {
                response.arrayBuffer().then(async buffer => await JSZip.loadAsync(buffer).then(async zip => {
                    await zip.file("trips.txt")?.async("string").then(contents => contents.split(/\r\n/).map(line => line.split(/,/)).slice(1).forEach(line => {tripsHash.set(Number(line[0]), line);}))
                    await zip.file("stops.txt")?.async("string").then(contents => contents.split(/\r\n/).map(line => line.split(/,/)).slice(1).forEach(line => {stopsHash.set(Number(line[0]), line);}))
                    await zip.file("routes.txt")?.async("string").then(contents => contents.split(/\r\n/).map(line => line.split(/,/)).slice(1).forEach(line => {routesHash.set(Number(line[0]), line);}))
                    await zip.file("shapes.txt")?.async("string").then(contents => contents.split(/\r\n/).map(line => line.split(/,/)).slice(1).forEach(line => {shapesHash.set(Number(line[0]), line);}))
                    
                    await zip.file("stop_times.txt")?.async("string").then(contents => contents.split(/\r\n/).map(line => line.split(/,/)).slice(1).forEach(line => {stopTimesHash.set(line[0], line);}))

                })).finally( () => {
                    console.log(tripsHash);
                    console.log(stopsHash);
                    console.log(routesHash);
                    console.log(shapesHash);
                    console.log(stopTimesHash);
                    console.log("done")
                });
            } else {
                console.warn("Could not fetch data of routes");
            }
        })
    }
    
    // Refreshes the cache in the browser
    async function refreshStaticGTFSCache() : Promise<ArrayBuffer | undefined> {
        try {
            await caches.open("gtfs-static").then(cache => cache.add(GTFS_STATIC_URL));
        } catch (error) {
            console.error("Error refreshing cache:", error);
            console.warn("The data was not Cached!");
        }

        return fetch(GTFS_STATIC_URL).then(response => response.arrayBuffer().then(buffer => buffer));
    }

    // Returns a bufferArray promise of the data from the server
    export async function getStaticGTFS() : Promise<ArrayBuffer | undefined> {
        if (!window.caches) { 
            // If caching does not exist on the browser, just return the data from the server
            console.warn("This browser does not support Cache!")
            return fetch(GTFS_STATIC_URL).then(response => response.arrayBuffer().then(buffer => buffer))
        } else {
            // Opens the cache
            return caches.open("gtfs-static").then(cache => cache.match(GTFS_STATIC_URL).then(async response => {
                // Checks if the data exists in the cache, if not, refresh it
                if (response) {
                    // Checks if the data in the contents are old, if they are, refresh the cache
                    // @ts-ignore
                    return response.arrayBuffer().then(buffer => JSZip.loadAsync(buffer).then(zip => zip.file("feed_info.txt").async("string").then(contents => {
                        const date = new Date() // Today's Date
                        
                        // Compare the old date to the new date, formatted in (yyyymmdd)
                        if (Number(contents.split("\r\n")[1].split(",")[5]) < Number([date.getFullYear(), date.getMonth(), date.getDate()].join())) {
                            return refreshStaticGTFSCache()  
                        } else {
                            return buffer
                        }
                    })))
                } else {
                    return refreshStaticGTFSCache()
                }
            }))
        }
    }

    // Returns the fetched data of the server
    export async function getRealtimeGTFS(route: string) {
        if (Object.keys(Routes.UNIVERSITY_ROUTES).indexOf(route) === -1) {
            // Non-University busses
            return fetch(GTFS_REALTIME_URL_TRANSIT).then(response => response?.arrayBuffer()).then(buffer => GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer)))
        } else {
            // University busses
            return fetch(GTFS_REALTIME_URL_UMN).then(response => response?.json())
        }
    }

    // Returns all the files from the server
    export async function getFiles() {
        // @ts-ignore
        return getStaticGTFS().then(buffer => JSZip.loadAsync(buffer).then(zip => zip.files))
    }
}

export default Data
