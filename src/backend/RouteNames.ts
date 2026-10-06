/** Full names of the routes the app features, by route ID */
export const ROUTE_NAMES: Record<string, string> = {
    "120": "120 East Bank Circulator",
    "121": "121 Campus Connector",
    "122": "122 University Ave Circulator",
    "123": "123 4th Street Circulator",
    "124": "124 St. Paul Circulator",
    "125": "125 Dinkytown Connector",
    "126": "126 Campus Express",
    "FOOTBALL": "Football Game Day Shuttle",
    "901": "METRO Blue Line",
    "902": "METRO Green Line",
    "925": "METRO E Line",
    "2": "2 Franklin Av / To Hennepin",
    "3": "3 U of M / Como Av / Dwtn Mpls",
};

/** Short labels for routes whose IDs aren't what riders call them */
const LABELS: Record<string, string> = { "901": "Blue Line", "902": "Green Line", "925": "E Line", "FOOTBALL": "Football" };

/**
 * What riders call a route: "Blue Line" for 901, "121" for 121
 * @param routeId ID of the route
 */
export function routeLabel(routeId: string) : string {
    return LABELS[routeId] ?? routeId;
}
