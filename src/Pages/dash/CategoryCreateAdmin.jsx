import React, { useState } from "react";
import axios from "axios";

const CategoryCreateAdmin = () => {
  const [category, setCategory] = useState("");
  const [maxRooms, setMaxRooms] = useState(1);
  const [status, setStatus] = useState("Active");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await axios.post("http://localhost:5000/api/room-categories/create", {
        category,
        max_rooms: maxRooms,
        status,
      });
      setResult(res.data);
      setCategory("");
      setMaxRooms(1);
      setStatus("Active");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Add Room Category (Admin)</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Category Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded"
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Max Rooms</label>
          <input
            type="number"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded"
            value={maxRooms}
            onChange={e => setMaxRooms(Number(e.target.value))}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Status</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded"
            value={status}
            onChange={e => setStatus(e.target.value)}
            required
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition-colors disabled:opacity-60"
          disabled={loading || !category || maxRooms < 1}
        >
          {loading ? "Adding..." : "Add Category"}
        </button>
      </form>
      {result && (
        <div className="mt-6 p-4 bg-green-100 rounded text-green-800">
          <div>{result.success ? "Category created successfully!" : result.message}</div>
        </div>
      )}
      {error && (
        <div className="mt-6 p-4 bg-red-100 rounded text-red-800">{error}</div>
      )}
    </div>
  );
};

export default CategoryCreateAdmin;
