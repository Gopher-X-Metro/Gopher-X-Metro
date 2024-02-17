import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import Hash from './Hash.ts';
import JSZip from "jszip";

namespace Data {
    // Loads the OPFS storage root and gtfs-static directory
    export async function load() : Promise<void> {
        let storageRoot : FileSystemDirectoryHandle;
        hashes = new Map<string, Hash<any>>()

        // Checks if browser supports OPFS
        try {
            storageRoot = await navigator.storage.getDirectory();
            // Sets up OPFS directory
            fileDirectoryHandle = await storageRoot.getDirectoryHandle("gtfs-static", { create: true });
        } catch( err ) {
            console.error( err );
            alert( "Couldn't open OPFS. See browser console.\n\n" + err );
            return;
        }

        // Checks if the data in the contents are old, if they are, refresh the cache
        caches.open("gtfs-static").then(cache => cache.match(GTFS_STATIC_URL).then(async response => {
            // Checks if the data exists in the cache, if not, refresh it
            if (response) {
                // Checks if the data in the contents are old, if they are, refresh the cache
                // @ts-ignore
                response.arrayBuffer().then(buffer => JSZip.loadAsync(buffer).then(zip => zip.file("feed_info.txt").async("string").then(contents => {
                    const date = new Date() // Today's Date
                    
                    // Compare the old date to the new date, formatted in (yyyymmdd)
                    if (Number(contents.split("\r\n")[1].split(",")[5]) < Number([date.getFullYear(), date.getMonth(), date.getDate()].join())) {
                        // Refresh if old
                        refreshStaticGTFSCache()  
                    }
                })))
            }
        }))

        // Load hashes
        await loadHash<Number>("trips.txt", 0);
        await loadHash<Number>("stops.txt", 0);
        await loadHash<Number>("routes.txt", 0);
        await loadHash<Number>("shapes.txt", 0);
        await loadHash<String>("stop_times.txt", 0);
    }

     // Returns the Hash of the data
    export function getHash(fileName: string) : Hash<any> {
        // @ts-ignore
        return hashes.get(fileName);
    }

    // Returns all the files from the server
    export async function getFiles() {
        //@ts-ignore
        return getStaticGTFS().then(async buffer => await JSZip.loadAsync(buffer).then(zip => zip.files))
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
                    return response.arrayBuffer().then(buffer => buffer);
                } else {
                    return refreshStaticGTFSCache()
                }
            }))
        }
    }

    // Returns the fetched data of the university busses
    export async function getRealtimeGTFSUniversity() : Promise<any> {
        return fetch(GTFS_REALTIME_URL_UMN).then(response => response?.json())
    }

    // Returns the fetched vehicle position data
    export async function getRealtimeGTFSVehiclePositions() : Promise<GtfsRealtimeBindings.transit_realtime.FeedMessage> {
        return fetch(GTFS_REALTIME_URL_VEHICLE_POSITIONS).then(response => response?.arrayBuffer()).then(buffer => GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer)))
    }

    // Returns the fetched 
    export async function getRealtimeGTFSTripUpdates() : Promise<GtfsRealtimeBindings.transit_realtime.FeedMessage> {
        return fetch(GTFS_REALTIME_URL_TRIP_UPDATES).then(response => response?.arrayBuffer()).then(buffer => GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer)))
    }


    //https://svc.metrotransit.org/index.html
    const GTFS_STATIC_URL = "https://svc.metrotransit.org/mtgtfs/gtfs.zip";
    const GTFS_REALTIME_URL_UMN = "https://api.peaktransit.com/v5/index.php?app_id=_RIDER&key=c620b8fe5fdbd6107da8c8381f4345b4&controller=vehicles2&action=list&agencyID=88";
    const GTFS_REALTIME_URL_VEHICLE_POSITIONS = 'https://svc.metrotransit.org/mtgtfs/vehiclepositions.pb';
    const GTFS_REALTIME_URL_TRIP_UPDATES = 'https://svc.metrotransit.org/mtgtfs/tripupdates.pb';
    const GTFS_REALTIME_URL_SERVICE_ALERTS = 'https://svc.metrotransit.org/mtgtfs/alerts.pb';
    
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

    // Gets data stored file in the OPFS file
    async function getFileContents(fileName: string) : Promise<string | undefined> {
        if (fileDirectoryHandle)
            try {
                return await fileDirectoryHandle.getFileHandle(fileName).then(async fileHandle => await fileHandle.getFile().then(async blob => await blob.text()));
            } catch (err) {
                console.error(err + "\nFile \"" + fileName + "\" does not exist yet, creating file... ");
            }
    } 

    // Stores the Hash object into a OPFS file
    async function storeHash(fileName: string, hash: Hash<any>) : Promise<void> {
        if (fileDirectoryHandle){
            fileDirectoryHandle.getFileHandle(fileName, {create: true}).then(fileHandle => {
                fileHandle.createWritable().then(file => {
                    file.write(hash.toJSON()).then(() => file.close());
                })
            })
        }
    }

    // Loads Hash Object
    async function loadHash<KeyType>(fileName: string, keyIndex: number) : Promise<void> {
        if (!hashes.has(fileName)) {
            let fileContents = await getFileContents(fileName);

            if (fileContents) {
                hashes.set(fileName, new Hash<KeyType>(fileContents));
            } else {
                await getFiles().then(async files => {
                    const newHash = new Hash<KeyType>(await files[fileName].async("string"), keyIndex);
                    storeHash(fileName, newHash);
                    hashes.set(fileName, newHash)
                })
            }
        }
    }

    let fileDirectoryHandle : FileSystemDirectoryHandle;
    let hashes : Map<string, Hash<any>>;
}

export default Data
