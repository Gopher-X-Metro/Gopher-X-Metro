import React, {useState} from 'react';

import URL from '../../../backend/URL.ts';
import RouteButton from './RouteButton.tsx';

/**
 * Creates route buttons for predifined routes in the url
 */
function RouteButtonAddons() {
    return (
        <>
        { Array.from(URL.getRoutes()).map(routeId => (<RouteButton key={routeId} routeId={routeId} text={routeId}/>)) }
        </>
    )
}

export default RouteButtonAddons;