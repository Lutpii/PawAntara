import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah form dari refresh halaman
    try {
      // Kirim permintaan POST ke endpoint registrasi
      await axios.post("http://localhost:3001/api/auth/register", {
        email,
        password,
      });
      alert("Registrasi berhasil! Silakan login.");
      navigate("/login"); // Arahkan ke halaman login setelah berhasil
    } catch (error) {
      console.error("Registrasi gagal:", error.response.data);
      alert("Registrasi gagal. Coba lagi.");
    }
  };

  return (
    <div>
      <h2>Registrasi Akun Baru</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegisterPage;
