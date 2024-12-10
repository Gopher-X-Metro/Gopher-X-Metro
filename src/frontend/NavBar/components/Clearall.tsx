import URL from "src/backend/URL";

/**
 * ClearAll Component
 * 
 * @returns Clears routes from URL
 */
namespace ClearAll {
    /**
     * Clears routes from URL
     */
    export function clearRoutes() {
        var url_routes = URL.getRoutes(); 
        console.log(url_routes);
        for (let route of url_routes) {
            console.log(url_routes.size + "size"); 
            URL.removeRoute(route);
            console.log(URL.getRoutes() + "after delete");
        }
    }
}

export default ClearAll;