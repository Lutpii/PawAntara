// src/components/SearchInput.js

const SearchInput = ({ searchTerm, setSearchTerm }) => {
  return (
    <div style={{ margin: "20px 0" }}>
      <input
        type="text"
        placeholder="Cari tugas..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "4px",
          border: "1px solid #ddd",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
};

export default SearchInput;
