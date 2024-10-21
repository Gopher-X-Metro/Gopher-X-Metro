namespace URL {
    const functions: Array<() => void> = [];

    /**
     * Gets routes from URL query string
     * @returns set of route IDs extracted from URL
     */
    export function getRoutes() : Set<string> { 
        return new Set((new URLSearchParams(window.location.search))
            .get("route")?.split(",")
            .filter(Boolean) ?? []
        ); 
    }

    /**
     * Adds new route to URL without reloading page.
     * Updates route param in query string
     * @param routeId route ID to add to URL
     */
    export function addRoute(routeId: string) : void {
        const currentRoutes = getRoutes();

        if (!currentRoutes.has(routeId)) {
            const updatedRoutes = currentRoutes.size === 0 ? routeId : `${Array.from(currentRoutes).join(",")},${routeId}`;
            window.history.replaceState(
                {}, 
                getQuerySelectorTextContext(), 
                `./?route=${updatedRoutes}`
            );
            onChange(); 
        }
    }

    /**
     * Removes specific route from URL without reloading the page
     * @param routeId route ID to remove
     */
    export function removeRoute(routeId: string) : void {
        const currentRoutes = getRoutes();

        if (currentRoutes.has(routeId)) {
            currentRoutes.delete(routeId);

            const updatedUrl = currentRoutes.size === 0 ? "./" : `./?route=${Array.from(currentRoutes).join(",")}`;
            window.history.replaceState(
                {}, 
                getQuerySelectorTextContext(), 
                updatedUrl
            );
            onChange();
        }
    }

    /**
     * Adds listener function triggered when URL changes
     * @param callbackfn function to be called when URL is updated
     */
    export function addListener(callbackfn: () => void) : void {
        functions.push(callbackfn);
    }

    /* Private Helper Methods */

    /**
     * Calls all registered listener functions when URL is updated
     */
    function onChange() : void { 
        functions.forEach(f => f()); 
    }

    /**
     * Gets document title as a string for updating browser history
     * @returns text content of title element or empty string if not found
     */
    function getQuerySelectorTextContext() : string {
        const query = document.querySelector("title");

        if (query && query.textContent) {
            return query.textContent;
        } else {
            console.warn("Could not get document.querySelector(\"title\").textContext!");
            return "";
        }
    }
}

export default URL;