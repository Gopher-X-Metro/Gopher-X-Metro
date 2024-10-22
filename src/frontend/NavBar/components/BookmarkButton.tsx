import URL from 'src/backend/URL.ts';
import React, { useEffect, useState } from 'react';
import { BsBookmarkStar } from 'react-icons/bs';
import { ControlPosition, MapControl } from '@vis.gl/react-google-maps';

function BookmarkButton() {
    const [, forceReload] = useState(1);
    const [bookmarked, setBookmarked] = useState(false);
    const [routes, setRoutes] = useState(new Set<string>());

    useEffect(() => setRoutes(URL.getRoutes()), []);

    URL.addListener(() => {
        forceReload(Math.random());
        setRoutes(URL.getRoutes());
    });

    const onClick = () => {
        // TODO: setBookmarked to flip the bookmark of a route
        // Temp
        setBookmarked(true);
    }

    return (
        <>
            <MapControl position={ControlPosition.RIGHT_BOTTOM}>
                <button hidden={routes.size !== 1}
                        id="bookmark-button" 
                        draggable="false"
                        aria-label="Center"
                        title="Center"
                        type="button"
                        className={"map-control-button bookmark-button" + (bookmarked ? " bookmarked" : "")} 
                        onClick={() => onClick()}>
                    <BsBookmarkStar className="icon" size={30}/>
                </button>
            </MapControl>
        </>
    )
}
export default BookmarkButton