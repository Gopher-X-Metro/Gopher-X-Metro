namespace URL {
    // Gets routes from url
    export function getRoutes() : string[] {
        const routes = (new URLSearchParams(window.location.search)).get("route")?.split(",")

        if (routes) { delete routes[routes?.indexOf("")] }

        return (routes === undefined) ? [] : routes
    }

    // Adds a new route to the UR, Sets the route without reloading the website
    export function addRoute(id: string) : void {
        window.history.replaceState({}, getQuerySelectorTextContext(), "./?route=" + getRoutes().join(",") + ("," + id))
    }

    // Removes the specified route from the URL
    export function removeRoute(id: string) : void {
        let routes = getRoutes();
        if (routes.indexOf(id) !== -1) {
            routes.splice(routes.indexOf(id), 1);
            window.history.replaceState({}, getQuerySelectorTextContext(), "./?route=" + routes.join(","))
        }
    }

    // Gets the url
    function getQuerySelectorTextContext() : string {
        const query = document.querySelector("title");

        if (query && query.textContent) {
            return query.textContent
        } else {
            console.warn("Could not get document.querySelector(\"title\").textContext!")
            return ""
        }
    }
}

export default URL;