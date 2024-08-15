import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Pages from './frontend/Pages/Pages.tsx';
import "./styles.css";

export default function App() {
  return (
    <BrowserRouter>
        <Pages />
    </BrowserRouter>
  );
}