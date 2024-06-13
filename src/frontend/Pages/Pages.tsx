import React from 'react';
import { Route, Routes } from "react-router-dom";

import Map from '../Map/Map.tsx';
import About from './About/About.tsx';
import Schedule from './Schedule/Schedule.tsx';

function Pages() {
    return (
        <Routes>
            <Route path="/" element={<Map />} />
            <Route path="/about" element={<About />} />
            <Route path="/schedule" element={<Schedule />} />
        </Routes>
    )
}

export default Pages;