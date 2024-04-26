namespace Plan {
    export async function trip() {
        let response = await fetch("https://svc.metrotransit.org/tripplanner/plantrip", {
            method: "POST",
            body: JSON.stringify({
                "origin": {
                  "description": "string",
                  "point": {
                    "x": 0,
                    "y": 0
                  },
                  "landmarkid": 0
                },
                "destination": {
                  "description": "string",
                  "point": {
                    "x": 0,
                    "y": 0
                  },
                  "landmarkid": 0
                },
                "arrdep": "string",
                "walkdist": 0,
                "minimize": "string",
                "accessible": true,
                "xmode": "string",
                "datetime": "2024-04-19T16:34:39.773Z"
              }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });

        return response;
    }

    export async function routeLandmarks(routeId: string, category: string) {
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

    export async function serviceNearby(latitude: number, longitude: number, description: string, landmarkid: number, walkdist: number) {
      let response = await fetch("https://svc.metrotransit.org/tripplanner/routelandmarks", {
          method: "POST",
          body: JSON.stringify({
              "location": {
                "description": description,
                "point": {
                  "x": latitude,
                  "y": longitude
                },
                "landmarkid": landmarkid
              },
              "walkdist": walkdist,
              "accessible": true
          }),
          headers: {
              "Content-type": "application/json; charset=UTF-8"
          }
      });

      return response.json();
  }

  export async function nearestParkAndRides(latitude: number, longitude: number, description: string, landmarkid: number) {
    let response = await fetch("https://svc.metrotransit.org/tripplanner/nearestparkandrides", {
        method: "POST",
        body: JSON.stringify({
          "location": {
            "description": description,
            "point": {
              "x": latitude,
              "y": longitude
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
    let response = await fetch("https://svc.metrotransit.org/tripplanner/nearestparkandrides", {
        method: "POST",
        body: JSON.stringify({
          "location": {
            "description": description,
            "point": {
              "x": latitude,
              "y": longitude
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

  export async function suggest(text: string, location: string) {
    let response = await fetch(`https://svc.metrotransit.org/tripplanner/suggest/${text}/${location}`);

    return response.json();
  } 

  export async function findaddress(magicKey: string) {
    let response = await fetch(`https://svc.metrotransit.org/tripplanner/findaddress/${magicKey}`);

    return response.json();
  }
}

export default Plan