import { promises } from "dns";
import _CacheError from "./internal/_CacheError";
import _ExistsError from "./internal/_ExistsError";
import _User from "./internal/_User";

namespace User {
    /** User Exists Error */
    export class ExistsError extends _ExistsError {};
    /** Cache Error */
    export class CacheError extends _CacheError {};

    /** The default user that is being used to store settings */
    const user = new _User("0");

    /**
     * Gets a value from the cache by looking up the key
     * @param key ID to look for in the cache
     * @returns a promise of the Response when calling for the key in the cache
     */
    export async function get(key: string) : Promise<Response> {
        return getCache("0")
        .then(cache => cache.match(key)
        .then(response => {
                if (!response || !response.ok) {
                    throw new _ExistsError(`The setting '${key}' was not found`);
                } 

                return response;
            }
        ));
    }

    /**
     * Sets the value of a key in the cache
     * @param key ID of the place in cache we want to store the value
     * @param value value that we want to set to the ID
     */
    export async function set(key: string, value: BodyInit): Promise<void> {
        (await getCache("0")).put(key, new Response(value, { status: 200 }));
    }

    /**
     * Gets the cache object for the user
     * @param id ID of the user
     * @returns Cache for the user
     */
    async function getCache(id: string) : Promise<Cache> {
        if ('caches' in window) {
            return caches.open(id);
        }

        throw new _CacheError(`Cache is not supported in this browser.`);
    }
}

export default User;