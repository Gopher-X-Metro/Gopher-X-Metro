import React, { useState } from 'react';

export default function LoadingScreen() {
    return ( 
        <>
            <div id="loading-screen" className="w-full" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'red', zIndex: 99}}>
                <h1>Loading...</h1>
                <h1>Loading...</h1>
                <h1>Loading...</h1>
                <h1>Loading...</h1>
                <h1>Loading...</h1>
                <h1>Loading...</h1>
                <h1>Loading...</h1>
                <h1>Loading...</h1>
                <h1>Loading...</h1>
                <h1>Loading...</h1>
                <h1>Loading...</h1>
                <h1>Loading...</h1>
            </div>  
        </>
    )

}
