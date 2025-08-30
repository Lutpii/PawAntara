const express = require("express");
const router = express.Router();
const db = require("../database/db"); // Mengimpor koneksi database

// Endpoint untuk mendapatkan semua tugas milik pengguna yang login
router.get("/", (req, res) => {
  // MODIFIKASI: Ambil user ID dari middleware
  const userId = req.user.id;

  // MODIFIKASI: Tambahkan klausa WHERE untuk user_id
  db.query(
    "SELECT * FROM todos WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).send("Internal Server Error");
      res.json(results);
    }
  );
});

// Endpoint untuk mendapatkan tugas spesifik milik pengguna yang login
router.get("/:id", (req, res) => {
  const userId = req.user.id;
  const todoId = req.params.id;

  // MODIFIKASI: Pastikan user hanya bisa mengambil todo miliknya sendiri
  db.query(
    "SELECT * FROM todos WHERE id = ? AND user_id = ?",
    [todoId, userId],
    (err, results) => {
      if (err) return res.status(500).send("Internal Server Error");
      if (results.length === 0)
        return res.status(404).send("Tugas tidak ditemukan");
      res.json(results[0]);
    }
  );
});

// Endpoint untuk menambahkan tugas baru untuk pengguna yang login
router.post("/", (req, res) => {
  const { task } = req.body;
  const userId = req.user.id;

  if (!task || task.trim() === "") {
    return res.status(400).send("Tugas tidak boleh kosong");
  }

  // MODIFIKASI: Tambahkan user_id saat INSERT
  db.query(
    "INSERT INTO todos (task, user_id) VALUES (?, ?)",
    [task.trim(), userId],
    (err, results) => {
      if (err) return res.status(500).send("Internal Server Error");
      const newTodo = {
        id: results.insertId,
        task: task.trim(),
        completed: false,
        user_id: userId,
      };
      res.status(201).json(newTodo);
    }
  );
});

// Endpoint untuk memperbarui tugas milik pengguna yang login
router.put("/:id", (req, res) => {
  const { task, completed } = req.body;
  const userId = req.user.id;
  const todoId = req.params.id;

  // MODIFIKASI: Pastikan user hanya bisa update todo miliknya sendiri
  db.query(
    "UPDATE todos SET task = ?, completed = ? WHERE id = ? AND user_id = ?",
    [task, completed, todoId, userId],
    (err, results) => {
      if (err) return res.status(500).send("Internal Server Error");
      if (results.affectedRows === 0)
        return res
          .status(404)
          .send("Tugas tidak ditemukan atau Anda tidak memiliki izin");
      res.json({ id: todoId, task, completed });
    }
  );
});

// Endpoint untuk menghapus tugas milik pengguna yang login
router.delete("/:id", (req, res) => {
  const userId = req.user.id;
  const todoId = req.params.id;

  // MODIFIKASI: Pastikan user hanya bisa delete todo miliknya sendiri
  db.query(
    "DELETE FROM todos WHERE id = ? AND user_id = ?",
    [todoId, userId],
    (err, results) => {
      if (err) return res.status(500).send("Internal Server Error");
      if (results.affectedRows === 0)
        return res
          .status(404)
          .send("Tugas tidak ditemukan atau Anda tidak memiliki izin");
      res.status(204).send();
    }
  );
});

module.exports = router;
