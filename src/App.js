import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";
import StockPage from "./pages/StockPage";
import AdminRegister from "./pages/AdminRegister";
import DailyEarnings from "./pages/DailyEarnings"; // <-- fixed path

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-admin" element={<AdminRegister />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/daily-earnings" element={<DailyEarnings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;