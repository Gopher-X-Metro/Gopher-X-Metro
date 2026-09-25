 # Gopher Buses X Metro Buses
##### *By: Adam, Ken, Riley, Will, Babacar, Alex, Mike, and Andy*
Our website includes maps of live-location **Gopher Buses along with Metro Buses and Lightrails** in the area surrounding campus. 
Our motivation is to **increase the accessibility** of campus transportation for students. The primary goal is to include Metro Buses and Light Rails
in a format visually similar to the [Gopher Trip Website](https://umn.rider.peaktransit.com/).

![]([https://raw.github.umn.edu/joh20327/Gopher-City-Bus/Develop/gophermetrowebsite.png?token=GHSAT0AAAAAAAAA2I62OSM5UBDQJ444OLAWZNLLNJA](https://raw.github.umn.edu/joh20327/Gopher-City-Bus/Develop/gophermetrowebsite.png?token=GHSAT0AAAAAAAAA2PHYLFBTOPZCD5HG634AZN4H7IQ))
Our website allows for concurrent, live updating views of both Metro Transit and University of Minnesota transportation options.

The University of Minnesota has included the [Transit Pass](https://pts.umn.edu/Transit/Transit-Passes/Universal-Transit-Pass "UMN Transit Pass") for students who pay the Transportation and Safety Fee (most students). 
The Transit Pass allows students to have access to the Metro Transit buses and the Green and Blue lines. 

#### This project was made using 
- Typescript
- Node.js
- React
- Metro Transit API
- Peak Transit API
- Leaflet + OpenStreetMap (CARTO tiles, Photon search)


[Github](https://github.umn.edu/joh20327/Gopher-City-Bus) \
[Original 2024 website](https://gopher-bus-x-metro-buses.vercel.app/) (no longer maintained)


## About this revival
The original project was built in 2024 by **Adam, Ken, Riley, Will, Babacar, Alex, Mike, and Andy**. In 2026 Ken revived it after the original hosting lapsed; the full commit history from the original team is preserved here.

Live site: https://gopher-x-metro.github.io/Gopher-X-Metro/

Changes made to bring it back online with no paid services or API keys:
- The map moved from Google Maps to [Leaflet](https://leafletjs.com/) with OpenStreetMap data, and place search uses [Photon](https://photon.komoot.io/).
- The Supabase backend was replaced with static JSON built from [Metro Transit's GTFS feed](https://svc.metrotransit.org/) by `scripts/build-gtfs.mjs`.
- A GitHub Action (`.github/workflows/deploy.yml`) rebuilds that data and redeploys to GitHub Pages every Monday and on every push to `main`.

Live vehicle locations still come straight from the Metro Transit and Peak Transit APIs in the browser.

### Running locally
```bash
npm install
curl -L -o gtfs.zip https://svc.metrotransit.org/mtgtfs/gtfs.zip
unzip gtfs.zip calendar.txt calendar_dates.txt routes.txt trips.txt shapes.txt stops.txt stop_times.txt -d gtfs
npm run gtfs gtfs
npm start
```
