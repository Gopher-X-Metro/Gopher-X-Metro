import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import Pages from './frontend/pages/Pages.tsx';
import NavBar from './frontend/NavBar/NavBar.tsx';

import "./styles.css"

export default function App() {
  return (
    <BrowserRouter>
      <NavBar/>
      <Pages/>
    </BrowserRouter>
  );
}
