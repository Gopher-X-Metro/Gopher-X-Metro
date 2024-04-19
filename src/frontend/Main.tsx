import React from "react";
import { Route, Routes } from "react-router-dom";
import Schedules from "./pages/Schedules.tsx";
import Map from "../frontend/Map/Map.tsx";

export default function Main() {
  return(
  <Routes>
    <Route path="/" element={<Map />} />
    <Route path="/schedules" element={<Schedules />} />
  </Routes>)
}
