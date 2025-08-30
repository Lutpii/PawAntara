// src/App.js

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home/HomePage";
import TodoPage from "./pages/Todo/TodoPage";
import Dht22Page from "./pages/SensorDHT/dhtPage";
import RegisterPage from "./pages/Register/registerPage"; // <-- Impor halaman registrasi
import LoginPage from "./pages/Login/loginPage"; // <-- Impor halaman login
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/todos" element={<TodoPage />} />
        <Route path="/dht22" element={<Dht22Page />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;
