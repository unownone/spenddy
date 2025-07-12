import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SourceLayout from "./pages/source/SourceLayout";
import SourceRoutes from "./pages/source";

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path=":source/*" element={<SourceLayout />}>
        <Route path="*" element={<SourceRoutes />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRouter; 