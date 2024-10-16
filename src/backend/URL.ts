namespace URL {

    /* Public */

    /**
     * Gets the routes from the URL as a Set
     */
    export function getRoutes() : Set<string> { return new Set((new URLSearchParams(window.location.search)).get("route")?.split(",").filter(String)); }
    /**
     * Adds a new route to the URL, Sets the route without reloading the website
     * @param routeId route ID to add
     */
    export function addRoute(routeId: string) : void {
        if (!URL.getRoutes().has(routeId)) {
            window.history.replaceState({}, getQuerySelectorTextContext(), "./?route=" + ((getRoutes().size === 0) ? routeId : (Array.from(getRoutes()).join(",") + "," + (routeId))));
            onChange(); 
        }

        const element = document.getElementsByClassName("bookmark-css");
        const routes = URL.getRoutes();
    
        let button:any;
        if(routes.size === 1 ){
            button = element[0] as HTMLElement;
            button.style.display = 'block';
        }else{
            button = element[0] as HTMLElement;
            button.style.display = 'none';
        }

    }
    /**
     * Removes the specified route from the URL
     * @param routeId route ID to remove
     */
    export function removeRoute(routeId: string) : void {

        const element = document.getElementsByClassName("bookmark-css");
        let button = element[0] as HTMLElement;
    
            if(URL.getRoutes().size === 1){
                button.style.display = 'none';
            }else if(URL.getRoutes().size === 2){
                button.style.display = 'block';
            }

        if (getRoutes().has(routeId)) {
            const routes = getRoutes();
            routes.delete(routeId);
            window.history.replaceState({}, getQuerySelectorTextContext(), (routes.size === 0) ? "./" : ("./?route=" + Array.from(routes).join(",")));
            onChange();
        }
    }
    /**
     * Runs functions to when the URL is updated
     * @param callbackfn function to run
     */
    export function addListener(callbackfn: () => void) : void {
        functions.push(callbackfn);
    }

    /* Private */
    const functions = new Array<() => void>();

    /**
     * Runs the listeners that were added
     */
    function onChange() { functions.forEach(f => f()); }

    /**
     * Gets the url
     */
    function getQuerySelectorTextContext() : string {
        const query = document.querySelector("title");

        if (query && query.textContent) {
            return query.textContent
        } else {
            console.warn("Could not get document.querySelector(\"title\").textContext!")
            return "";
        }
    }
}

export default URL;