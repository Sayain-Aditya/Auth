import React, { useEffect, useState } from "react";
import axios from "axios";

const RoomManageAdmin = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        let res = await axios.get("http://localhost:5000/api/room-categories/all");
        setCategories(res.data.categories || res.data || []);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setRooms([]);
      return;
    }
    const fetchRooms = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`http://localhost:5000/api/rooms/by-category/${selectedCategory}`);
        setRooms(res.data.rooms || []);
      } catch {
        setRooms([]);
        setError("Failed to fetch rooms");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [selectedCategory, success]);

  const handleUnbook = async (roomId) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.put(`http://localhost:5000/api/rooms/update/${roomId}`, { is_oos: false });
      setSuccess("Room unbooked successfully!");
    } catch {
      setError("Failed to unbook room");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roomId) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.delete(`http://localhost:5000/api/rooms/delete/${roomId}`);
      setSuccess("Room deleted successfully!");
    } catch {
      setError("Failed to delete room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Manage Rooms (Admin)</h2>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Room Category</label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          <option value="">Select category</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.category}</option>
          ))}
        </select>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="p-2 bg-red-100 text-red-800 rounded mb-2">{error}</div>}
      {success && <div className="p-2 bg-green-100 text-green-800 rounded mb-2">{success}</div>}
      <table className="w-full border-collapse mt-4">
        <thead>
          <tr>
            <th className="border px-2 py-1">Room #</th>
            <th className="border px-2 py-1">Title</th>
            <th className="border px-2 py-1">Booked?</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map(room => (
            <tr key={room._id}>
              <td className="border px-2 py-1">{room.room_number}</td>
              <td className="border px-2 py-1">{room.title}</td>
              <td className="border px-2 py-1">{room.is_oos ? "Yes" : "No"}</td>
              <td className="border px-2 py-1">
                {room.is_oos && (
                  <button
                    className="mr-2 px-2 py-1 bg-blue-500 text-white rounded"
                    onClick={() => handleUnbook(room._id)}
                  >
                    Unbook
                  </button>
                )}
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => handleDelete(room._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoomManageAdmin;
