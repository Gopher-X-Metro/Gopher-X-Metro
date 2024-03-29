import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import Pages from './frontend/Pages/Pages.tsx';
import NavBar from './frontend/NavBar/NavBar.tsx';

import "./styles.css";
import Main from "./frontend/Main.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <NavBar/>
      <Pages/>
    </BrowserRouter>
  );
}
