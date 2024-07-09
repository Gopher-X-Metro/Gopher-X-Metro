import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import Pages from 'src/frontend/Pages/Pages.tsx';
import NavBar from 'src/frontend/NavBar/NavBar.tsx';

import "src/styles.css"

export default function App() {
  return (
    <BrowserRouter>
      <NavBar/>
      <Pages/>
    </BrowserRouter>
  );
}