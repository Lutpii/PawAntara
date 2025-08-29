// src/components/TodoItem.js

import React, { useState } from "react";

const TodoItem = ({ todo, onToggleCompleted, onDeleteTodo, onUpdateTodo }) => {
  // State untuk mode edit dan menyimpan teks yang sedang diedit
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(todo.task);

  const handleSave = () => {
    if (editedTask.trim()) {
      onUpdateTodo(todo.id, editedTask);
      setIsEditing(false); // Kembali ke mode tampil setelah menyimpan
    }
  };

  const handleCancel = () => {
    setEditedTask(todo.task); // Kembalikan teks ke semula
    setIsEditing(false); // Batal edit
  };

  return (
    <li
      style={{
        marginBottom: "10px",
        border: "1px solid white",
        padding: "10px",
        borderRadius: "8px",
        backgroundColor: todo.completed ? "#2d3d3d" : "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      {isEditing ? (
        // TAMPILAN MODE EDIT
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <input
            type="text"
            value={editedTask}
            onChange={(e) => setEditedTask(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "none",
              width: "calc(100% - 16px)",
            }}
          />
          <div style={{ display: "flex", gap: "5px" }}>
            <button
              onClick={handleSave}
              style={{
                padding: "5px 10px",
                backgroundColor: "lightgreen",
                border: "none",
                borderRadius: "4px",
              }}
            >
              Simpan
            </button>
            <button
              onClick={handleCancel}
              style={{
                padding: "5px 10px",
                backgroundColor: "lightgray",
                border: "none",
                borderRadius: "4px",
              }}
            >
              Batal
            </button>
          </div>
        </div>
      ) : (
        // TAMPILAN MODE NORMAL (SEPERTI SEMULA)
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <h3
            style={{
              margin: 0,
              textDecoration: todo.completed ? "line-through" : "none",
            }}
          >
            {todo.task}
          </h3>
          <div style={{ display: "flex", gap: "5px" }}>
            <button
              onClick={() =>
                onToggleCompleted(todo.id, todo.completed)
              } /* style */
            >
              {todo.completed ? "Belum Selesai" : "Selesai"}
            </button>
            {/* TOMBOL EDIT BARU */}
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: "5px 10px",
                backgroundColor: "lightblue",
                border: "none",
                borderRadius: "4px",
              }}
            >
              Edit
            </button>
            <button onClick={() => onDeleteTodo(todo.id)} /* style */>
              Hapus
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

export default TodoItem;
// done
// done