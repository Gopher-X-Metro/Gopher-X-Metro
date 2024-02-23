import React from "react";
import Map from "./frontend/Map.tsx";
import NavBar from "./frontend/NavBar.tsx";

import "./styles.css";
import Main from "./frontend/Main.tsx";

export default function App() {
  return (
    <>
      <NavBar />
      <Main />
    </>
  );
}
