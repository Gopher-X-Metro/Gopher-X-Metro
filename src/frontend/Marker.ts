// User Location Marker
namespace Marker {  
    export function init(map: google.maps.Map) : void {
        marker = new window.google.maps.Marker({
            map: map,
            label: "You"
        });

        // Centers at User Location
        navigator.geolocation.getCurrentPosition(position => { 
            if (position.coords.accuracy < 1000) // If accuraccy is too low, don't center
            map.setCenter({ lat: position.coords.latitude, lng: position.coords.longitude })
            
            // console.log(position)
        })
    }

    // Updates User Location
    export function update() : void {
        navigator.geolocation.getCurrentPosition(position => { 
            marker.setPosition({ lat: position.coords.latitude, lng: position.coords.longitude })
            marker.setVisible(position.coords.accuracy < 1000) // If accuraccy is too low, don't display
        })
    }

    let marker : google.maps.Marker;
}

export default Marker;