import React from 'react';
import { Route, Routes } from "react-router-dom";

import Map from '../Map/Map.tsx';
import About from './About/About.tsx';
import Schedules from 'src/frontend/Pages/Schedules.tsx';
//TODO: complete deprecation
// import Schedule from './Schedule/Schedule.tsx'; 

function Pages() {
    return (
        <Routes>
            <Route path="/" element={<Map />} />
            {/* TODO: complete deprecation */}
            {/* <Route path="/schedules" element={<Schedules />} /> */}
            <Route path="/about" element={<About />} />
            <Route path="/schedules" element={<Schedules />} />
        </Routes>
    )
}

export default Pages;