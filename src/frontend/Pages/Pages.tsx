import React from 'react';
import { Route, Routes } from "react-router-dom";

import Map from './Map/Map.tsx';
import About from './About/About.tsx';
import Schedules from './Schedule/Schedules.tsx';

export default function Pages() {
    return (
        <Routes>
            <Route path="/" element={<Map />} />
            <Route path="/about" element={<About />} />
            <Route path="/schedules" element={<Schedules />} />
        </Routes>
    )
}