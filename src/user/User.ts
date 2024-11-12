import { promises } from "dns";
import _CacheError from "src/user/internal/_CacheError";
import _ExistsError from "src/user/internal/_ExistsError";
import _User from "src/user/internal/_User";

namespace User {
    /** User Exists Error */
    export class ExistsError extends _ExistsError {};
    /** Cache Error */
    export class CacheError extends _CacheError {};

    /** Default user that is being used to store settings */
    const user = new _User("0");

    /**
     * Gets value from cache by looking up key
     * @param key ID to look for in cache
     * @returns a promise of the Response when calling for key in the cache
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
     * Sets value of key in cache
     * @param key ID of place in cache we want to store the value
     * @param value value that we want to set to the ID
     */
    export async function set(key: string, value: BodyInit): Promise<void> {
        (await getCache("0")).put(key, new Response(value, { status: 200 }));
    }

    /**
     * Gets cache object for user
     * @param id ID of user
     * @returns Cache for user
     */
    async function getCache(id: string) : Promise<Cache> {
        if ("caches" in window) {
            return caches.open(id);
        }

        throw new _CacheError(`Cache is not supported in this browser.`);
    }
}

export default User;