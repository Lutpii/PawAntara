import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Kirim permintaan POST ke endpoint login
      const response = await axios.post(
        "http://localhost:3001/api/auth/login",
        { email, password }
      );

      // Simpan token yang diterima ke Local Storage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user)); // <-- TAMBAHKAN INI

      alert("Login berhasil!");
      navigate("/"); // Arahkan ke halaman utama/dashboard setelah login
    } catch (error) {
      console.error("Login gagal:", error.response.data);
      alert("Login gagal. Periksa kembali email dan password Anda.");
    }
  };

  return (
    <div>
      <h2>Login</h2>
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
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginPage;
