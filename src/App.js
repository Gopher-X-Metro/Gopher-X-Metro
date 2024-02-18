import React from 'react';
import Map from './frontend/Map.tsx'
import NavBar from './frontend/NavBar.tsx';

import "./styles.css"
import LoadingScreen from './frontend/LoadingScreen.tsx';

export default function App() {
  return (
    <>
      <NavBar />
      <Map />
    </>
  );
}
