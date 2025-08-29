import React, { useState, useEffect, useCallback } from "react";
import DataTable from "react-data-table-component";
import Modal from "react-modal";
import SearchInput from "../../components/SearchInput.js"; // Asumsi SearchInput.js sudah ada

// Konfigurasi Modal untuk aksesibilitas (ditempatkan di luar komponen)
Modal.setAppElement("#root");

const TodoPage = () => {
  // Bagian State Management
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk Modal Edit
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [currentTodo, setCurrentTodo] = useState(null);
  const [editedTask, setEditedTask] = useState("");

  // State untuk Modal Tambah
  const [addModalIsOpen, setAddModalIsOpen] = useState(false);
  const [newTask, setNewTask] = useState("");

  // --- Bagian Logika & API Call ---

  // Mengambil data dari server
  const fetchTodos = useCallback((searchQuery) => {
    setLoading(true);
    const url = searchQuery
      ? `/api/todos?search=${encodeURIComponent(searchQuery)}`
      : "/api/todos";
    fetch(url)
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        setTodos(data.todos);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setTodos([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Efek untuk Debounce pada pencarian
  useEffect(() => {
    const timerId = setTimeout(() => {
      fetchTodos(searchTerm);
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm, fetchTodos]);

  // Handler untuk menambah data
  const handleAddTodo = () => {
    if (!newTask.trim()) return;
    fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: newTask }),
    })
      .then(() => {
        fetchTodos(searchTerm);
        closeAddModal();
      })
      .catch((err) => console.error("Error adding todo:", err));
  };

  // Handler untuk menghapus data
  const handleDeleteTodo = (id) => {
    fetch(`/api/todos/${id}`, { method: "DELETE" })
      .then(() => fetchTodos(searchTerm))
      .catch((err) => console.error("Error deleting todo:", err));
  };

  // Handler untuk mengupdate teks tugas
  const handleUpdateTodo = (id, updatedTask) => {
    fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: updatedTask }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Gagal memperbarui todo");
        fetchTodos(searchTerm);
        closeEditModal();
      })
      .catch((err) => console.error("Error updating todo task:", err));
  };

  // --- Bagian Fungsi Modal ---

  // Fungsi untuk Modal Edit
  const openEditModal = (todo) => {
    setCurrentTodo(todo);
    setEditedTask(todo.task);
    setEditModalIsOpen(true);
  };
  const closeEditModal = () => setEditModalIsOpen(false);
  const handleEditModalSubmit = (e) => {
    e.preventDefault();
    if (currentTodo) {
      handleUpdateTodo(currentTodo.id, editedTask);
    }
  };

  // Fungsi untuk Modal Tambah
  const openAddModal = () => setAddModalIsOpen(true);
  const closeAddModal = () => {
    setAddModalIsOpen(false);
    setNewTask("");
  };
  const handleAddModalSubmit = (e) => {
    e.preventDefault();
    handleAddTodo();
  };

  // --- Bagian Definisi Kolom Tabel ---

  const columns = [
    { name: "No", selector: (row, index) => index + 1, width: "60px" },
    { name: "Tugas", selector: (row) => row.task, sortable: true, wrap: true },
    {
      name: "Status",
      selector: (row) => (row.completed ? "Selesai" : "Belum Selesai"),
      sortable: true,
    },
    {
      name: "Aksi",
      cell: (row) => (
        <div>
          <button
            onClick={() => openEditModal(row)}
            style={{
              marginRight: "5px",
              backgroundColor: "#f0ad4e",
              color: "white",
              border: "none",
              padding: "5px 10px",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteTodo(row.id)}
            style={{
              backgroundColor: "#d9534f",
              color: "white",
              border: "none",
              padding: "5px 10px",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            Hapus
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  // --- Bagian Render JSX ---

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1000px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Manajemen Tugas</h1>

      <button
        onClick={openAddModal}
        style={{
          backgroundColor: "#0275d8",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "4px",
          fontSize: "16px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        Tambah
      </button>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "4px",
          padding: "15px",
        }}
      >
        <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <DataTable
          columns={columns}
          data={todos}
          progressPending={loading}
          pagination
          highlightOnHover
          striped
        />
      </div>

      {/* Modal untuk Edit Data */}
      {currentTodo && (
        <Modal
          isOpen={editModalIsOpen}
          onRequestClose={closeEditModal}
          contentLabel="Edit Todo Modal"
          style={{
            content: {
              top: "50%",
              left: "50%",
              right: "auto",
              bottom: "auto",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
              width: "400px",
            },
            overlay: { backgroundColor: "rgba(0, 0, 0, 0.75)" },
          }}
        >
          <h2>Edit Tugas</h2>
          <form onSubmit={handleEditModalSubmit}>
            <input
              type="text"
              value={editedTask}
              onChange={(e) => setEditedTask(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "15px",
                boxSizing: "border-box",
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: "#5cb85c",
                color: "white",
                border: "none",
                padding: "10px 15px",
                marginRight: "5px",
                cursor: "pointer",
              }}
            >
              Simpan Perubahan
            </button>
            <button
              type="button"
              onClick={closeEditModal}
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                padding: "10px 15px",
                cursor: "pointer",
              }}
            >
              Batal
            </button>
          </form>
        </Modal>
      )}

      {/* Modal untuk Tambah Data */}
      <Modal
        isOpen={addModalIsOpen}
        onRequestClose={closeAddModal}
        contentLabel="Tambah Todo Modal"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "400px",
          },
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.75)" },
        }}
      >
        <h2>Tambah Tugas Baru</h2>
        <form onSubmit={handleAddModalSubmit}>
          <input
            type="text"
            placeholder="Masukkan tugas baru..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "15px",
              boxSizing: "border-box",
            }}
            autoFocus
          />
          <button
            type="submit"
            style={{
              backgroundColor: "#5cb85c",
              color: "white",
              border: "none",
              padding: "10px 15px",
              marginRight: "5px",
              cursor: "pointer",
            }}
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={closeAddModal}
            style={{
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              padding: "10px 15px",
              cursor: "pointer",
            }}
          >
            Batal
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default TodoPage;
