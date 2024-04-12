import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import Hash from './Hash.ts';
import JSZip from "jszip";

namespace Data {
    
    /* Public */

    /**
     * Loads the OPFS storage root and gtfs-static directory
     */
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

        // Load hashes
        // await loadHash<Number>("trips.txt", 0);
        // await loadHash<Number>("stops.txt", 0);
        // await loadHash<Number>("routes.txt", 0);
        // await loadHash<Number>("shapes.txt", 0);
        // await loadHash<String>("stop_times.txt", 0);
    }
    /**
     * Gets the Hash object of the data from a file
     * @param fileName name of the file
     */
    export function getHash(fileName: string) : Hash<any> {
        // @ts-ignore
        return hashes.get(fileName);
    }
    /**
     * Gets all the files from the server
     */
    export async function getFiles() {
        //@ts-ignore
        return getStaticGTFS().then(async buffer => await JSZip.loadAsync(buffer).then(zip => zip.files))
    }
    /**
     * Gets a bufferArray promise of the data from the server
     */
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
    /**
     * Gets the fetched data of the university busses
     */
    export async function getRealtimeGTFSUniversity(): Promise<any> {
        const response = await fetch(GTFS_REALTIME_URL_UMN);

        // if (response.status === 404) {
        //     console.log(`Data fetching encountered status code 404 (Not Found) with University Data.`);
        //     throw new Error(`Data fetching encountered status code 404 (Not Found) with University Data`);
        // }

        // if (response.ok) {
            return response.json();
        // } else {
        //     const responseBodyText = await response.text(); // Get the response body as text
        //     console.log(`Data fetching encountered status code ${response.status} with University Data. Response Body: ${responseBodyText}`);
        //     throw new Error(`Data fetching encountered status code ${response.status} with University Data. Response Body: ${responseBodyText}`);
        // }

    }
    /**
     * Gets the fetched vehicle position data
     */
    export async function getRealtimeGTFSVehiclePositions() : Promise<GtfsRealtimeBindings.transit_realtime.FeedMessage> {
        return fetch(GTFS_REALTIME_URL_VEHICLE_POSITIONS).then(response => response?.arrayBuffer()).then(buffer => GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer)))
    }
    /**
     * Gets the fetched trip updates data
     */
    export async function getRealtimeGTFSTripUpdates() : Promise<GtfsRealtimeBindings.transit_realtime.FeedMessage> {
        return fetch(GTFS_REALTIME_URL_TRIP_UPDATES).then(response => response?.arrayBuffer()).then(buffer => GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer)))
    }

    /* Private */
    
    /**
     * Loads a hash object baised on a file
     * @param fileName name of the file
     * @param keyIndex index of the line that will be the key
     */
    async function loadHash<KeyType>(fileName: string, keyIndex: number) : Promise<void> {
        if (!hashes.has(fileName)) {
            let fileContents = await getFileContents(fileName);

            if (fileContents) {
                hashes.set(fileName, new Hash<KeyType>(fileContents));
            } else {
                if (!files)
                    files = await getFiles();

                files[fileName].nodeStream().pipe(process.stdout)

                const newHash = new Hash<KeyType>(await files[fileName].async("binarystring"), keyIndex);                
                storeHash(fileName, newHash);
                hashes.set(fileName, newHash);
            }
        }
    }
    /**
     * Stores the Hash object into a OPFS file
     * @param fileName name of the file
     * @param hash hash object
     */
    async function storeHash(fileName: string, hash: Hash<any>) : Promise<void> {
        if (fileDirectoryHandle){
            fileDirectoryHandle.getFileHandle(fileName, {create: true}).then(fileHandle => {
                fileHandle.createWritable().then(file => {
                    file.write(hash.toJSON()).then(() => file.close());
                })
            })
        }
    }
    /**
     * Refreshes the cache in the browser and returns the data
     */
    async function refreshStaticGTFSCache() : Promise<ArrayBuffer | undefined> {
        try {
            await caches.open("gtfs-static").then(cache => cache.add(GTFS_STATIC_URL));
        } catch (error) {
            console.error("Error refreshing cache:", error);
            console.warn("The data was not Cached!");
        }

        return fetch(GTFS_STATIC_URL).then(response => response.arrayBuffer().then(buffer => buffer));
    }
    /**
     * Gets data stored file in the OPFS file and returns its contents
     * @param fileName name of the file
     */
    async function getFileContents(fileName: string) : Promise<string | undefined> {
        if (fileDirectoryHandle)
            try {
                return await fileDirectoryHandle.getFileHandle(fileName).then(async fileHandle => await fileHandle.getFile().then(async blob => await blob.text()));
            } catch (err) {
                console.error(err + "\nFile \"" + fileName + "\" does not exist yet, creating file... ");
            }
    } 

    let fileDirectoryHandle : FileSystemDirectoryHandle;
    let hashes : Map<string, Hash<any>>;
    let files : {
        [key: string]: JSZip.JSZipObject;
    };

    //https://svc.metrotransit.org/index.html
    const GTFS_STATIC_URL = "https://svc.metrotransit.org/mtgtfs/gtfs.zip";
    const GTFS_REALTIME_URL_UMN = "https://api.peaktransit.com/v5/index.php?app_id=_RIDER&key=c620b8fe5fdbd6107da8c8381f4345b4&controller=vehicles2&action=list&agencyID=88";
    const GTFS_REALTIME_URL_VEHICLE_POSITIONS = 'https://svc.metrotransit.org/mtgtfs/vehiclepositions.pb';
    const GTFS_REALTIME_URL_TRIP_UPDATES = 'https://svc.metrotransit.org/mtgtfs/tripupdates.pb';
    const GTFS_REALTIME_URL_SERVICE_ALERTS = 'https://svc.metrotransit.org/mtgtfs/alerts.pb';
}

export default Data
