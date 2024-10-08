import URL from 'src/backend/URL.ts';
import Schedule from 'src/backend/Schedule'; 
import Peak from 'src/backend/Peak';

namespace SearchFeature {
    /* Public */

    /**
     * Runs when a search is requested for a route
     */
    export async function searchRoute() {
        const routeInput = document.getElementById("search_route") as HTMLInputElement | null;
        
        if (routeInput) {
            const routeId = routeInput.value;
            // Checks if the route exists
            if (Peak.UNIVERSITY_ROUTES[routeId] || (await Schedule.getRoute(routeId))) {
                showError(false)
                if (URL.getRoutes().has(routeId))
                    URL.removeRoute(routeId);
                else
                    URL.addRoute(routeId);
            } else showError(true)
        } else {
            showError(true);
            console.warn("error input is not a value"); // checks if routeInput has a value
        }
    }

    /* Private */

    /**
     * Shows the error of the route not existing
     * @param show if the error should be shown
     */
    function showError( show : boolean ) {
        const errorElement = document.getElementById("error_text")!;

        if (show) {
            errorElement.style.display = "block";
            errorElement.innerHTML = "Route doesn't exist!";
        } else {
            errorElement.style.display = "none";
            errorElement.innerHTML = '';
        }
    }
}

export default SearchFeature
