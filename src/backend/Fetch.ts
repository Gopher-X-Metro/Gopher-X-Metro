/**
 * Fetches JSON, returning undefined when the request fails or the body isn't JSON
 * @param url address to fetch
 */
export async function getJSON(url: string) : Promise<any> {
    try {
        const response = await fetch(url);
        return response.ok ? await response.json() : undefined;
    } catch {
        return undefined;
    }
}

const cache = new Map<string, { time: number, ttl: number, data: Promise<any> }>();

/**
 * Fetches JSON and reuses the answer for a while, sharing one request between callers
 * @param url   address to fetch
 * @param ttl   how long to reuse a successful answer, in milliseconds
 */
export function getCachedJSON(url: string, ttl: number) : Promise<any> {
    const hit = cache.get(url);
    if (hit && Date.now() - hit.time < hit.ttl) return hit.data;

    const data = getJSON(url);
    cache.set(url, { time: Date.now(), ttl, data });
    // Failed requests are retried soon instead of being reused
    data.then(result => { if (result === undefined) cache.set(url, { time: Date.now(), ttl: 5000, data }); });
    return data;
}
