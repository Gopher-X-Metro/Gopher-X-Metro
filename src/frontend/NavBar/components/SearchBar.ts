import Routes from "src/frontend/Pages/Map/components/Routes";
import Plan from "src/backend/Plan";
import Search from "src/frontend/Pages/Map/elements/Search";

namespace SearchBar {
    /**
     * Initalizes the search bar in map
     * @param _map map object
     */
    export function init(_map: google.maps.Map) : void {
        map = _map;

        input = document.getElementById("search-bar") as HTMLInputElement;
        autocomplete = new google.maps.places.Autocomplete(input, { fields: ["place_id", "geometry", "name", "formatted_address"] });
        geocoder = new google.maps.Geocoder();

        autocomplete.bindTo("bounds", map);
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

        autocomplete.addListener("place_changed", () => onPlaceChange());
    }

    /* Private */
    const searches = new Map<string, Search>();
    let input: HTMLInputElement;
    let autocomplete: google.maps.places.Autocomplete;
    let geocoder: google.maps.Geocoder;
    let map: google.maps.Map;

    /**
     * Sets the new location of the marker, and focuses on the spot
     */
    function onPlaceChange() : void {
        const place = autocomplete.getPlace();

        if (!place.place_id) return;

        if (searches.has(place.place_id)) {
            searches.get(place.place_id)?.setVisible(true);
        } else {
            geocoder
            .geocode({ placeId: place.place_id })
            .then(async ({ results }) => {
                const location = results[0].geometry.location;

                searches.set(place.place_id as string, new Search(place.place_id as string, place.name, location, map));

                map.setZoom(15);
                map.setCenter(location);

                Plan.serviceNearby(location.lat(), location.lng(), null, 0, 0.3).then(async nearest => {
                    if (nearest.version !== 0) {
                        for (const stop of nearest.atstop) {
                            Routes.loadStop(stop.stopid, "").then(s => {
                                if (s) searches.get(place.place_id as string)?.addElement(s);
                                s?.addElement(searches.get(place.place_id as string) as Search);
                                s?.updateVisibility();
                            });
                        }
                    }
                })

                // if (place.formatted_address) {
                //     const plan = await (await Plan.trip("Coffman Memorial Union, Washington Avenue Southeast, Minneapolis, MN, USA", place.formatted_address)).json();
                //     console.log(plan.routes);
                //     plan.routes.forEach(route => {
                //         const steps = route.legs[0].steps;
                //         steps.forEach(step => {
                //             if (step.transitDetails) {
                //                 const stopDetails = step.transitDetails.stopDetails;
                //                 const transitLine = step.transitDetails.transitLine;
                //                 const arrivalLocation = stopDetails.arrivalStop.location.latLng;
                //                 const departureLocation = stopDetails.departureStop.location.latLng;

                //                 console.log(transitLine);
                //                 console.log(departureLocation);
                //                 console.log(arrivalLocation);
                //             }
                //         });
                //     });
                // }

                // console.log(await Plan.serviceNearby(location.lat(), location.lng(), null, 0, 0.3));
                // console.log(await Plan.nearestLandmark(location.lat(), location.lng(), null, 3, 10, null));
                // console.log(await Plan.nearestParkAndRides(location.lat(), location.lng(), null, 1));
                
                // let center = { lat: 44.97369560732433, lng: -93.2317259515601 }; // UMN location
                // console.log(await Plan.serviceNearby(center.lat, center.lng, null, 1, 20))
                // console.log(await Plan.routeLandmarks(routeId, null))
                // console.log(await Plan.serviceNearby(center.lat, center.lng, null, 902, 0))
                // console.log(await Plan.nearestLandmark(center.lat, center.lng, "3462", 1, 10, null))
                // console.log(await Plan.nearestParkAndRides(center.lat, center.lng, null, 1))
                // console.log(await Plan.suggest("Comst", null))
                // console.log(await Plan.findaddress("dHA9MCNsb2M9MjY4MCNsbmc9MCNwbD0zOTcwI2xicz0xNDozMTQ="))

            }).catch((error) => window.alert("Geocoder failed due to: " + error));
        }
    }
}


export default SearchBar;