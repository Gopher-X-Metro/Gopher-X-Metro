import React from "react";
import { Route, Routes } from "react-router-dom";
import Map from "./Map.tsx";
import Schedules from "./pages/Schedules.tsx";

export default function Main() {
  return(
  <Routes>
    <Route path="/" element={<Map />} />
    <Route path="/schedules" element={<Schedules />} />
  </Routes>)
}
