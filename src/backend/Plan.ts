import proj4 from "proj4";

namespace Plan {

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