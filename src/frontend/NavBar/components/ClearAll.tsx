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
        for (let route of url_routes) {
            URL.removeRoute(route);
        }
    }
}

export default ClearAll;