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
        console.log("Adding route:", routeId, "Current routes before:", Array.from(getRoutes()));
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
        console.log(currentRoutes,"line 42");

        if (currentRoutes.has(routeId)) {
            //currentRoutes.delete(routeId);
            console.log("delete");

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
        if(!functions.includes(callbackfn)){
            functions.push(callbackfn);
        }   
    }

    /**
     * Removes listener function
     * @param callbackfn function to be removed from the listener list
     */
    export function removeListener(callbackfn: () => void): void {
        const index = functions.indexOf(callbackfn);
        if (index !== -1) {
            functions.splice(index, 1);
        }
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