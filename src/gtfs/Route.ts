import Paths from "./Paths.ts";
import Stops from "./Stops.ts";

class Route {
    id: string;
    paths: Paths;
    stops: Stops;

    constructor(id: string) {
        this.id = id;
        this.paths = new Paths()
        this.stops = new Stops()
    }

    setBolded(bold: boolean) {
        this.paths.forEach(path => {
            path.setBolded(bold)
        })
    }

    setVisible(visible: boolean) {
        this.paths.forEach(path => {
            path.setVisible(visible)
        })

        this.stops.forEach(stop => {
            stop.setVisible(visible)
        })
    }
}

export default Route