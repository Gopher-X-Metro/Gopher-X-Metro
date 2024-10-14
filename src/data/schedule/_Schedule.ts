import Schedule from "src/backend/Schedule";
import _Route from "./internal/_Route";

class _Schedule {
    constructor() {
        this.routes = new Map<string, Promise<_Route>>();

        Schedule.getRoutes().then(routes => {
            for (const route of routes) {
                console.log(routes);
            }
        })
    }

    private routes: Map<string, Promise<_Route>>;
}

export default _Schedule;