import GtfsRealtimeBindings from "gtfs-realtime-bindings";

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
 * Runs a request and reuses its answer for a while, sharing one request between callers
 * @param key   what the answer is cached under
 * @param ttl   how long to reuse a successful answer, in milliseconds
 * @param load  makes the request; resolves to undefined on failure
 */
function cached<T>(key: string, ttl: number, load: () => Promise<T | undefined>) : Promise<T | undefined> {
    const hit = cache.get(key);
    if (hit && Date.now() - hit.time < hit.ttl) return hit.data;

    const data = load().catch(() => undefined);
    cache.set(key, { time: Date.now(), ttl, data });
    // Failed requests are retried soon instead of being reused
    data.then(result => { if (result === undefined) cache.set(key, { time: Date.now(), ttl: 5000, data }); });
    return data;
}

/**
 * Fetches JSON and reuses the answer for a while, sharing one request between callers
 * @param url   address to fetch
 * @param ttl   how long to reuse a successful answer, in milliseconds
 */
export function getCachedJSON(url: string, ttl: number) : Promise<any> {
    return cached(url, ttl, () => getJSON(url));
}

/**
 * Fetches a GTFS-realtime protobuf feed and reuses the decoded entities for a while
 * @param url   address of the feed
 * @param ttl   how long to reuse a successful answer, in milliseconds
 */
export function getCachedFeed(url: string, ttl: number) : Promise<GtfsRealtimeBindings.transit_realtime.IFeedEntity[] | undefined> {
    return cached(url, ttl, async () => {
        const response = await fetch(url);
        if (!response.ok) return undefined;
        return GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(await response.arrayBuffer())).entity;
    });
}
