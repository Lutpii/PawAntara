import React, { useState, useEffect, useRef } from "react"; // 1. Import useRef
import "./dhtPage.css";

function Dht22Page() {
  const [suhu, setSuhu] = useState("--.-");
  const [kelembapan, setKelembapan] = useState("--.-");
  const [statusKoneksi, setStatusKoneksi] = useState("Menghubungkan...");

  // 2. Buat ref untuk menyimpan instance WebSocket
  const ws = useRef(null);

  useEffect(() => {
    // 3. Hanya buat koneksi baru jika belum ada
    if (!ws.current) {
      // Menggunakan 127.0.0.1 sebagai ganti localhost
      ws.current = new WebSocket("ws://127.0.0.1:5000");

      ws.current.onopen = () => {
        console.log("Terhubung ke server WebSocket!");
        setStatusKoneksi("Terhubung");
      };

      ws.current.onclose = () => {
        console.log("Koneksi WebSocket terputus");
        setStatusKoneksi("Koneksi Terputus");
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket Error:", error);
        setStatusKoneksi("Error Koneksi");
      };
    }

    // Fungsi untuk menangani pesan yang masuk
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Data sensor diterima:", data);

        if (data.topic === "sensor/dht22/suhu") {
          setSuhu(parseFloat(data.payload).toFixed(2));
        } else if (data.topic === "sensor/dht22/kelembapan") {
          setKelembapan(parseFloat(data.payload).toFixed(2));
        }
      } catch (error) {
        console.error("Gagal mem-parsing data JSON:", error);
      }
    };

    // Tambahkan event listener untuk pesan
    ws.current.addEventListener("message", handleMessage);

    // Fungsi cleanup
    return () => {
      // 4. Hapus event listener saat komponen unmount untuk menghindari memory leak
      if (ws.current) {
        ws.current.removeEventListener("message", handleMessage);
      }
    };
  }, []); // Dependensi tetap kosong

  return (
    <div className="dht-container">
      <div className="dht-card">
        <h1>Live Sensor Dashboard</h1>
        <div className="sensor-readings">
          <div className="reading">
            <span className="label">Suhu</span>
            <span className="value">{suhu} &deg;C</span>
          </div>
          <div className="reading">
            <span className="label">Kelembapan</span>
            <span className="value">{kelembapan} %</span>
          </div>
        </div>
        <p className="status">Status Koneksi: {statusKoneksi}</p>
        <a href="/" className="back-link">
          Kembali ke Home
        </a>
      </div>
    </div>
  );
}

export default Dht22Page;
