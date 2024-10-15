import { Route } from 'react-router-dom';
import URL from 'src/backend/URL.ts';
import RouteButton from 'src/frontend/NavBar/components/RouteButton.tsx';
import { createRoot } from 'react-dom/client';
import React, {useState } from 'react';
namespace Bookmark_icon{
    

    export function AddRouteToFavorite(){
        const element = document.getElementById("Favorite-routeButton");
        
        var URL_route = URL.getRoutes();

       for (let route of URL_route){
            console.log(route);

            if(element){
                const root = createRoot(element);
                root.render(
                    <RouteButton routeId={route} text={"idk"}/>, 
                );
            }


       }
    } 
}
export default Bookmark_icon