import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SourceLayout from "./pages/source/SourceLayout";
import SourceRoutes from "./pages/source";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Privacy Policy accessible via /privacy-policy and /source/privacy-policy */}
      <Route path="privacy-policy" element={<PrivacyPolicy />} />
      <Route path="source/privacy-policy" element={<PrivacyPolicy />} />
      <Route path=":source/*" element={<SourceLayout />}>
        <Route path="*" element={<SourceRoutes />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRouter; 