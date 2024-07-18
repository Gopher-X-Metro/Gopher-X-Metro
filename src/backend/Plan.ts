import proj4 from "proj4";

namespace Plan {
    export async function trip(origin: string, destination: string) 
      {
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

    export async function routeLandmarks(routeId: string, category: string | null) {
        let response = await fetch("https://svc.metrotransit.org/tripplanner/routelandmarks", {
            method: "POST",
            body: JSON.stringify({
                "route": routeId,
                "category": category,
                "noduplicates": true
              }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });

        return response.json();
    }

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

  export async function suggest(text: string | null, location: string | null) {
    let response = await fetch(`https://svc.metrotransit.org/tripplanner/suggest/${text}/${location}`);

    return response.json();
  } 

  export async function findaddress(magicKey: string) {
    let response = await fetch(`https://svc.metrotransit.org/tripplanner/findaddress/${magicKey}`);

    return response.json();
  }

  function fromUTMtoLatLng(x: number, y: number) : google.maps.LatLng {
    const coordinates = proj4("+proj=utm +zone=15", "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs", [x, y]);
    return new google.maps.LatLng(coordinates["1"], coordinates["0"]);
  }

  function fromLatLngtoUTM(latitude: number, longitude: number) : { x:number, y:number } {
    proj4.defs([
    [
      "EPSG:4326",
      "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees"
    ],
    ["EPSG:AUTO", `+proj=utm +zone=15 +datum=WGS84 +units=m +no_defs`]]);

    const coordinates = proj4("EPSG:4326", "EPSG:AUTO", [longitude, latitude]);
    return { x: coordinates["0"], y: coordinates["1"] };
  }
}

export default Plan