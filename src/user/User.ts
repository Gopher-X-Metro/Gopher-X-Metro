import _CacheError from "./internal/_CacheError";
import _ExistsError from "./internal/_ExistsError";
import _User from "./internal/_User";

namespace User {
    export class ExistsError extends _ExistsError {};
    export class CacheError extends _CacheError {};

    const user = new _User("0");

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

    export async function set(key: string, value: BodyInit) {
        (await getCache("0")).put(key, new Response(value, { status: 200 }));
    }

    async function getCache(id: string) : Promise<Cache> {
        if ('caches' in window) {
            return caches.open(id);
        }

        throw new _CacheError(`Cache is not supported in this browser.`);
    }
}

export default User;