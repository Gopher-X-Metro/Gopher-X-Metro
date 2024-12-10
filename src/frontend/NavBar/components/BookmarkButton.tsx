import React, { useEffect, useState } from "react";
import { BsBookmarkStar } from "react-icons/bs";
import { ControlPosition, MapControl } from "@vis.gl/react-google-maps";
import ReactDOM from "react-dom/client";
import URL from "src/backend/URL";
import RouteButton from "src/frontend/NavBar/components/RouteButton";
import User from "src/user/User";

export function BookmarkButton() {
    const [, forceReload] = useState(1);
    const [bookmarked, setBookmarked] = useState(false); 
    const [routes, setRoutes] = useState(new Set<string>());
    const [favorited, setFavorited] = useState(new Set<string>());
    const [root, setRoot] = useState<any>();
    const [Highlighted, setHighlight] = useState(false);

    const updateButtons = () => {
        const element = <div>
            {Array.from(favorited.keys()).map((routeId) => 
                <RouteButton key={routeId} routeId={routeId} text={"Route " + routeId}/>
            )}
            </div>
            
        if (root) {
            root.render(element);
        }
    }

    const showHighlight = () => {
        const routeId = Array.from(routes)[0];
        const show = favorited.has(routeId);

        if(show){
            setHighlight(true);
        }else{
            setHighlight(false);
        }
    }

    useEffect(()=> {
        updateButtons();
        showHighlight();
    });

    useEffect(() => {
        setRoot(ReactDOM.createRoot(document.getElementById('Favorite-tab')));
        setRoutes(URL.getRoutes());
        (async () => {
            try {
                const data = await User.get("favorited-routes").then(response => response.json());
                setFavorited(new Set(data));
                console.log(data);
                updateButtons();
            } catch (error : unknown) {
                console.error("The User cache of \"favorited-routes\" cache was not found.", error);
            }
        }) ()
        
    }, []);

    URL.addListener(() => {
        forceReload(Math.random());
        setRoutes(URL.getRoutes());
    });

    const onClick = () => {
       
        const routeId = Array.from(routes)[0];
        const booked = favorited.has(routeId);
        setBookmarked(!booked);
       
        if (booked) {
            favorited.delete(routeId);
        } else {
            favorited.add(routeId);
        }
        User.set("favorited-routes", JSON.stringify(Array.from(favorited)));
    }

    return (
        <>
            <MapControl position={ControlPosition.RIGHT_BOTTOM}>
                <button hidden={URL.getRoutes().size !== 1}
                        id="bookmark-button" 
                        draggable="false"
                        aria-label="Center"
                        title="Center"
                        type="button"
                        className={"map-control-button bookmark-button " + (Highlighted ? "bookmark-highlight" : "bookmark-default")} 
                        onClick={() => onClick()}>
                <BsBookmarkStar className="icon" size={30}/>
                </button>
            </MapControl>
        </>
    );
}

export default BookmarkButton;