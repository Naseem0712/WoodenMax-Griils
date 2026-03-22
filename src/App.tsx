import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import Calculator from './pages/Calculator';
import Comparisons from './pages/Comparisons';
import ToolsGuide from './pages/ToolsGuide';
import GrillTypes from './pages/GrillTypes';

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Calculator />} />
            <Route path="comparisons" element={<Comparisons />} />
            <Route path="tools-guide" element={<ToolsGuide />} />
            <Route path="grill-types" element={<GrillTypes />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}
