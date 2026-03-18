import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages Imports
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";
import StockPage from "./pages/StockPage";
import AdminRegister from "./pages/AdminRegister";
import DailyEarnings from "./pages/DailyEarnings";
import ForgotPassword from "./pages/ForgotPassword"; // Ang bagong page

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === AUTH ROUTES === */}
        {/* Default route is Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        
        {/* Registration Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/register-admin" element={<AdminRegister />} />
        
        {/* Password Recovery Route */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* === MAIN APPLICATION ROUTES === */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/daily-earnings" element={<DailyEarnings />} />

        {/* Catch-all route: Redirect back to login if path doesn't exist */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;