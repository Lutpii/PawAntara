// src/pages/HomePage.js

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const HomePage = () => {
  // State untuk menyimpan status login dan data user
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // useEffect akan berjalan saat komponen pertama kali dimuat
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fungsi untuk menangani logout
  const handleLogout = () => {
    // Hapus data dari localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Update state
    setIsLoggedIn(false);
    setUser(null);

    // Arahkan kembali ke halaman utama
    navigate("/");
    alert("Anda telah logout.");
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    textAlign: "center",
    backgroundColor: "#282c34",
    color: "white",
    fontFamily: "sans-serif",
  };

  const buttonStyle = {
    padding: "10px 20px",
    fontSize: "1.2em",
    marginTop: "20px",
    backgroundColor: "#61dafb",
    color: "#282c34",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    textDecoration: "none",
  };

  return (
    <div style={containerStyle}>
      <h1>Selamat Datang di Aplikasi Todo List</h1>

      {/* Tampilkan pesan selamat datang jika user sudah login */}
      {isLoggedIn && user && <h2>Selamat Datang, {user.email}!</h2>}

      <p>Kelola semua tugas Anda dengan mudah dan efisien.</p>

      <Link to="/todos" style={buttonStyle}>
        Lihat Daftar Todo
      </Link>
      <Link to="/dht22" style={buttonStyle}>
        Lihat Sensor DHT22
      </Link>

      {/* Conditional Rendering untuk tombol Login/Logout */}
      {isLoggedIn ? (
        <button onClick={handleLogout} style={buttonStyle}>
          Logout
        </button>
      ) : (
        <>
          <Link to="/register" style={buttonStyle}>
            Register
          </Link>
          <Link to="/login" style={buttonStyle}>
            Login
          </Link>
        </>
      )}
    </div>
  );
};

export default HomePage;
