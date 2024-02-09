import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import JSZip from "jszip";

namespace Data {
    // University Routes
    export const UNIVERSITY_ROUTES = {
        "120": 11324, 
        "121": 11278, 
        "122": 11279, 
        "123": 11280, 
        "124": 11281
    }

    // Returns a bufferArray promise of the data from the server
    export async function getStaticGTFS() : Promise<ArrayBuffer | undefined> {
        // test();
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
        if (Object.keys(UNIVERSITY_ROUTES).indexOf(route) === -1) {
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

    const GTFS_STATIC_URL = "https://svc.metrotransit.org/mtgtfs/gtfs.zip";
    const GTFS_REALTIME_URL_UMN = "https://api.peaktransit.com/v5/index.php?app_id=_RIDER&key=c620b8fe5fdbd6107da8c8381f4345b4&controller=vehicles2&action=list&agencyID=88";
    const GTFS_REALTIME_URL_TRANSIT = 'https://svc.metrotransit.org/mtgtfs/vehiclepositions.pb';

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
}

export default Data