import proj4 from "proj4";

/* Currently not being used */
namespace Plan {
    /**
     * Requests a trip from given origin to destination using Google's routes API
     * @param origin starting address for the trip
     * @param destination destination address for the trip
     * @returns response object
     */
    export async function trip(origin: string, destination: string) {
      let response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
        method: "POST",
        body: JSON.stringify({
          "origin": {
            "address": origin
          },
          "destination": {
            "address": destination
          },
          "travelMode": "TRANSIT",
          "computeAlternativeRoutes": true,
          "transitPreferences": {
            routingPreference: "LESS_WALKING",
            allowedTravelModes: ["TRAIN"]
          },
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          "X-Goog-Api-Key": process.env.REACT_APP_API_KEY ? process.env.REACT_APP_API_KEY : "",
          "X-Goog-FieldMask": "routes.legs.steps.transitDetails"
        }
      });

      return response;
    }

    /**
     * Fetches route landmarks based on routeId and optional category
     * @param routeID ID of route
     * @param category category of landmarks to retrieve
     * @returns JSON response object
     */
    export async function routeLandmarks(routeID: string, category: string | null) {
      let response = await fetch("https://svc.metrotransit.org/tripplanner/routelandmarks", {
        method: "POST",
        body: JSON.stringify({
          "route": routeID,
          "category": category,
          "noduplicates": true
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      });

      return response.json();
    }

    /**
     * Finds nearby services to a given location
     * @param latitude latitude of location
     * @param longitude longitude of location
     * @param description optional description of location
     * @param landmarkid ID of nearby landmark
     * @param walkdist maximum walking distance
     * @returns JSON response object
     */
    export async function serviceNearby(latitude: number, longitude: number, description: string | null, landmarkid: number, walkdist: number) {
      const coordinates = fromLatLngtoUTM(latitude, longitude);

      let response = await fetch("https://svc.metrotransit.org/tripplanner/servicenearby", {
        method: "POST",
        body: JSON.stringify({
          "location": {
            "description": description,
            "point": {
              "x": coordinates.x,
              "y": coordinates.y
            },
            "landmarkid": landmarkid
          },
          "walkdist": walkdist,
          "accessible": false
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
    });

    return response.json();
  }

  /**
     * Finds nearest Park and Ride facilities to given location
     * @param latitude latitude of location
     * @param longitude longitude of location
     * @param description optional description of location
     * @param landmarkid ID of nearby landmark
     * @returns JSON response object
     */
  export async function nearestParkAndRides(latitude: number, longitude: number, description: string | null, landmarkid: number) {
    const coordinates = fromLatLngtoUTM(latitude, longitude);

    let response = await fetch("https://svc.metrotransit.org/tripplanner/nearestparkandrides", {
      method: "POST",
      body: JSON.stringify({
        "location": {
          "description": description,
          "point": {
            "x": coordinates.x,
            "y": coordinates.y
          },
          "landmarkid": landmarkid
        }
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    });

    return response.json();
  }

  /**
     * Finds the nearest landmarks to a given location
     * @param latitude latitude of location
     * @param longitude longitude of location
     * @param description optional description of location
     * @param landmarkid ID of nearby landmark
     * @param maxanswers maximum number of landmarks to return
     * @param category optional category of landmarks
     * @returns JSON response object
     */
  export async function nearestLandmark(latitude: number, longitude: number, description: string | null, landmarkid: number, maxanswers: number, category: string | null) {
    const coordinates = fromLatLngtoUTM(latitude, longitude);

    let response = await fetch("https://svc.metrotransit.org/tripplanner/nearestlandmark", {
      method: "POST",
      body: JSON.stringify({
        "location": {
          "description": description,
          "point": {
            "x": coordinates.x,
            "y": coordinates.y
          },
          "landmarkid": landmarkid
        },
        "maxanswers": maxanswers,
        "category": category
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    });

    return response.json();
  }

  /**
     * Provides location suggestions based on user input
     * @param text optional text to search for suggestions
     * @param location optional location filter for suggestions
     * @returns JSON response object
     */
  export async function suggest(text: string | null, location: string | null) {
    let response = await fetch(`https://svc.metrotransit.org/tripplanner/suggest/${text}/${location}`);

    return response.json();
  } 

  /**
     * Finds address based on a provided magic key
     * @param magicKey unique key to find address
     * @returns JSON response object
     */
  export async function findaddress(magicKey: string) {
    let response = await fetch(`https://svc.metrotransit.org/tripplanner/findaddress/${magicKey}`);

    return response.json();
  }

  /**
     * Converts latitude and longitude to UTM coordinates
     * @param latitude latitude to convert
     * @param longitude longitude to convert
     * @returns object containing the UTM x and y coordinates
     */
  function fromLatLngtoUTM(latitude: number, longitude: number) : { x: number, y: number } {
    proj4.defs([
      [
        "EPSG:4326",
        "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees"
      ],
      [
        "EPSG:AUTO", 
        "+proj=utm +zone=15 +datum=WGS84 +units=m +no_defs"
      ]
    ]);

    const coordinates = proj4("EPSG:4326", "EPSG:AUTO", [longitude, latitude]);
    return { x: coordinates["0"], y: coordinates["1"] };
  }

  /* Deprecated / Never Used */

  /**
     * Converts UTM coordinates to latitude and longitude
     * @param x UTM x coordinate
     * @param y UTM y coordinate
     * @returns google.maps.LatLng object representing latitude and longitude.
     */
  function fromUTMtoLatLng(x: number, y: number) : google.maps.LatLng {
    const coordinates = proj4("+proj=utm +zone=15", "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs", [x, y]);
    return new google.maps.LatLng(coordinates["1"], coordinates["0"]);
  }
}

export default Plan