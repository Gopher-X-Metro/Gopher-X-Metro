namespace RouteURL {

    /* Public */

    /**
     * Gets the routes from the URL as a Set
     */
    export function getRoutes() : Set<string> {
        return new Set((new URLSearchParams(window.location.search)).get("route")?.split(",").map(normalize).filter(String));
    }
    /**
     * Turns what a rider types or links ("green line", " e ", "football") into a route ID
     * @param text route number or name
     */
    export function normalize(text: string) : string {
        const clean = text.trim().toUpperCase().replace(/\s+LINE$/, "").replace(/^METRO\s+/, "").replace(/^ROUTE\s+/, "");
        return ROUTE_ALIASES[clean] ?? clean;
    }
    /**
     * Adds a new route to the URL without reloading the website
     * @param routeId route ID to add
     */
    export function addRoute(routeId: string) : void {
        const routes = getRoutes();
        if (!routes.has(routeId)) setRoutes(routes.add(routeId));
    }
    /**
     * Removes the specified route from the URL
     * @param routeId route ID to remove
     */
    export function removeRoute(routeId: string) : void {
        const routes = getRoutes();
        if (routes.delete(routeId)) setRoutes(routes);
    }
    /**
     * Runs a function whenever the URL's routes change
     * @param callbackfn function to run
     * @returns a function that stops listening
     */
    export function addListener(callbackfn: () => void) : () => void {
        listeners.add(callbackfn);
        return () => { listeners.delete(callbackfn); };
    }

    /* Private */

    // Names riders use for routes whose IDs are numbers
    const ROUTE_ALIASES = {
        "BLUE": "901", "GREEN": "902", "RED": "903", "ORANGE": "904", "GOLD": "905",
        "A": "921", "B": "922", "C": "923", "D": "924", "E": "925",
        "FOOTBALL SHUTTLE": "FOOTBALL", "GAME DAY": "FOOTBALL",
    };
    const listeners = new Set<() => void>();

    /** Writes the routes to the URL and runs the listeners */
    function setRoutes(routes: Set<string>) : void {
        window.history.replaceState(window.history.state, "", routes.size === 0 ? "./" : "./?route=" + [...routes].join(","));
        listeners.forEach(f => f());
    }
}

export default RouteURL;
