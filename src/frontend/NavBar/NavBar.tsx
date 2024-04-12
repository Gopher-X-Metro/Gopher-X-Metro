import React from 'react';
import TitleBar from './components/TitleBar.tsx';
import SideBar from './components/SideBar.tsx';

/**
 * Navbar Component
 */
export default function NavBar() {
    return (
        <>
            <TitleBar/>
            <SideBar/>
            
            <div id = "main">
                <button className="AboutButton" onClick={() => window.location.href = './about'}>
                &#8942;
                </button>
            </div>
        </>
    );
};
