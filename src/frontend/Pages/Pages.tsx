import React from 'react';
import { Route, Routes } from "react-router-dom";

import Map from '../Map/Map.tsx';
import About from './About/About.tsx';
import Schedules from "../../frontend/Pages/components/Schedule.tsx";

function Pages() {
    return (
        <Routes>
            <Route path="/" element={<Map />} />
            <Route path="/about" element={<About />} />
            <Route path="/schedules" element={<Schedules />} />
        </Routes>
    )
}

export default Pages;