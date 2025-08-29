require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http"); // Diperlukan untuk WebSocket
const WebSocket = require("ws"); // Library WebSocket
const mqtt = require("mqtt"); // Library MQTT

const app = express();
const todoRoutes = require("./routes/tododb.js");
const { todos } = require("./routes/todo.js"); // Menambahkan ini untuk mengimpor data dummy
const db = require("./database/db");
const port = process.env.PORT;

// Membuat server HTTP dan WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Pengaturan dan koneksi ke MQTT Broker
const MQTT_BROKER = "mqtt://192.168.137.1"; // sesuaikan lihat IP address broker MQTT
const MQTT_PORT = 1883;
const MQTT_TOPICS = ["sensor/dht22/suhu", "sensor/dht22/kelembapan"];// sesuaikan topik yang ingin di-subscribe

const mqttClient = mqtt.connect(MQTT_BROKER, {
  port: MQTT_PORT,
  username: "mqtt", // sesuaikan di broker MQTT
  password: "admin", // sesuaikan di broker MQTT
});

mqttClient.on("connect", () => {
  console.log("Terhubung ke MQTT Broker!");
  MQTT_TOPICS.forEach((topic) => {
    mqttClient.subscribe(topic, (err) => {
      if (!err) {
        console.log(`Berhasil subscribe ke topik: ${topic}`);
      }
    });
  });
});

// Menerima pesan dari MQTT dan meneruskannya ke semua klien WebSocket
mqttClient.on("message", (topic, payload) => {
  console.log(`Pesan diterima dari topik ${topic}: ${payload.toString()}`);
  const dataToSend = JSON.stringify({
    topic: topic,
    payload: payload.toString(),
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(dataToSend);
    }
  });
});

// Menangani koneksi baru dari klien (React)
wss.on("connection", (ws) => {
  console.log("Klien (React) terhubung via WebSocket");
  ws.on("close", () => {
    console.log("Koneksi klien (React) terputus");
  });
});


// file statis
const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);

// Menggunakan middleware CORS
app.use(cors());

app.use(express.json());

// Atur EJS sebagai view engine
app.set("view engine", "ejs");

app.use("/todos", todoRoutes);

app.get("/", (req, res) => {
  res.render("index", {
    layout: "layouts/main-layout",
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    layout: "layouts/main-layout", // Jika layout-nya bernama main-layout.ejs
  });
});

app.get("/todo-list", (req, res) => {
  res.render("todos-page", { layout: "layouts/main-layout", todos: todos }); // Merender todos-page.ejs dan meneruskan data todos
});

app.get("/todo-view", (req, res) => {
  db.query("SELECT * FROM todos", (err, todos) => {
    if (err) return res.status(500).send("Internal Server Error");
    res.render("todo", {
      layout: "layouts/main-layout",
      todos: todos,
    });
  });
});

// Endpoint API untuk Todo
// GET: Mengambil semua todos
app.get("/api/todos", (req, res) => {
  const { search } = req.query;
  console.log(
    `Menerima permintaan GET untuk todos. Kriteria pencarian: '${search}'`
  );
  let query = "SELECT * FROM todos";
  const params = [];
  if (search) {
    query += " WHERE task LIKE ?";
    params.push(`%${search}%`);
  }
  db.query(query, params, (err, todos) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    console.log("Berhasil mengirim todos:", todos.length, "item.");
    res.json({ todos: todos });
  });
});

// POST: Menambah todo baru
app.post("/api/todos", (req, res) => {
  const { task } = req.body;
  console.log("Menerima permintaan POST untuk menambah task:", task);

  if (!task) {
    console.error("Task tidak ditemukan di body permintaan.");
    return res.status(400).json({ error: "Task is required" });
  }
  const query = "INSERT INTO todos (task, completed) VALUES (?, ?)";
  db.query(query, [task, false], (err, result) => {
    if (err) {
      console.error("Database insert error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    console.log("Todo berhasil ditambahkan dengan ID:", result.insertId);
    res.status(201).json({
      message: "Todo added successfully",
      id: result.insertId,
      task,
      completed: false,
    });
  });
});

// PUT: Memperbarui todo (bisa status 'completed' atau 'task')
app.put("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  const { task, completed } = req.body;
  console.log(`Menerima permintaan PUT untuk ID: ${id} dengan data:`, req.body);

  // Bagian untuk membangun query secara dinamis
  const updateFields = [];
  const values = [];

  if (task !== undefined) {
    updateFields.push("task = ?");
    values.push(task);
  }

  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      return res
        .status(400)
        .json({ error: "Invalid 'completed' value. Must be a boolean." });
    }
    updateFields.push("completed = ?");
    values.push(completed);
  }

  // Jika tidak ada data yang valid untuk diupdate
  if (updateFields.length === 0) {
    return res.status(400).json({ error: "No valid fields to update." });
  }

  values.push(id); // Tambahkan ID untuk klausa WHERE

  const query = `UPDATE todos SET ${updateFields.join(", ")} WHERE id = ?`;

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Database update error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.affectedRows === 0) {
      console.error("Todo tidak ditemukan untuk ID:", id);
      return res.status(404).json({ error: "Todo not found" });
    }
    console.log(`Todo dengan ID ${id} berhasil diperbarui.`);
    res.json({ message: "Todo updated successfully" });
  });
});

// DELETE: Menghapus todo berdasarkan ID
app.delete("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  console.log(`Menerima permintaan DELETE untuk ID: ${id}`);
  const query = "DELETE FROM todos WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Database delete error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.affectedRows === 0) {
      console.error("Todo tidak ditemukan untuk ID:", id);
      return res.status(404).json({ error: "Todo not found" });
    }
    console.log(`Todo dengan ID ${id} berhasil dihapus.`);
    res.json({ message: "Todo deleted successfully" });
  });
});

// Middleware untuk menangani 404 Not Found
app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

// UBAH BARIS INI: Gunakan server.listen, bukan app.listen
server.listen(port, () => {
  console.log(`Server Express & WebSocket berjalan di http://localhost:${port}`);
});
