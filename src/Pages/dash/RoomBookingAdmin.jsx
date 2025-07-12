import React, { useEffect, useState } from "react";
import axios from "axios";
import CategoryCreateAdmin from "./CategoryCreateAdmin";

const RoomBookingAdmin = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [roomCount, setRoomCount] = useState(1);
  const [bookingResult, setBookingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  // Room details for booking
  const [title, setTitle] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [price, setPrice] = useState("");
  const [extraBed, setExtraBed] = useState(false);
  const [description, setDescription] = useState("");
  const [roomsInCategory, setRoomsInCategory] = useState([]);
  const [categoryStats, setCategoryStats] = useState({ empty: 0, filled: 0, total: 0 });
  const [selectedCategoryObj, setSelectedCategoryObj] = useState(null);
  // Add this to trigger refresh after booking
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Fetch all categories (try both possible endpoints)
    const fetchCategories = async () => {
      try {
        let res = await axios.get("http://localhost:5000/api/room-categories/all");
        if (res.data.categories) {
          setCategories(res.data.categories);
        } else if (Array.isArray(res.data)) {
          setCategories(res.data);
        } else {
          setCategories([]);
        }
      } catch {
        // fallback: try /api/roomCategory or /api/room-categories
        try {
          let res = await axios.get("http://localhost:5000/api/room-categories");
          setCategories(res.data.categories || res.data || []);
        } catch {
          setCategories([]);
        }
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setRoomsInCategory([]);
      setCategoryStats({ empty: 0, filled: 0, total: 0 });
      setSelectedCategoryObj(null);
      return;
    }
    // Fetch rooms for selected category
    const fetchRoomsAndCategory = async () => {
      try {
        // Fetch rooms
        const res = await axios.get(`http://localhost:5000/api/rooms/by-category/${selectedCategory}`);
        setRoomsInCategory(res.data.rooms || []);
        // Fetch category
        let cat = categories.find(c => c._id === selectedCategory);
        if (!cat) {
          // fallback: fetch from API
          const catRes = await axios.get(`http://localhost:5000/api/room-categories/all`);
          cat = (catRes.data.categories || catRes.data || []).find(c => c._id === selectedCategory);
        }
        setSelectedCategoryObj(cat);
        // Calculate stats
        const filled = (res.data.rooms || []).filter(r => r.is_oos).length;
        const empty = cat ? cat.max_rooms : 0;
        const total = empty + filled;
        setCategoryStats({ empty, filled, total });
      } catch (err) {
        setRoomsInCategory([]);
        setCategoryStats({ empty: 0, filled: 0, total: 0 });
        setSelectedCategoryObj(null);
      }
    };
    fetchRoomsAndCategory();
  }, [selectedCategory, categories, refreshKey]);

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setBookingResult(null);
    try {
      // Call the backend API to book rooms in the selected category with details
      const res = await axios.post("http://localhost:5000/api/rooms/book", {
        category: selectedCategory,
        count: roomCount,
        title,
        room_number: roomNumber,
        price,
        extra_bed: extraBed,
        description,
      });
      setBookingResult(res.data);
      // Reset form fields after booking
      setTitle("");
      setRoomNumber("");
      setPrice("");
      setExtraBed(false);
      setDescription("");
      setRoomCount(1);
      // Trigger refresh of stats/room list
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Book a Room (Admin)</h2>
      <button
        type="button"
        className="mb-4 px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition-colors"
        onClick={() => setShowCategoryForm((prev) => !prev)}
      >
        {showCategoryForm ? "Hide Category Form" : "Add Room Category"}
      </button>
      {showCategoryForm && <CategoryCreateAdmin />}
      <form onSubmit={handleBook}>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Room Title</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Room Title"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Room Number</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded"
            value={roomNumber}
            onChange={e => setRoomNumber(e.target.value)}
            placeholder="Room Number"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Price</label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="Price"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Extra Bed</label>
          <input
            type="checkbox"
            className="mr-2"
            checked={extraBed}
            onChange={e => setExtraBed(e.target.checked)}
          />
          <span>Yes</span>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Room Category</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            required
          >
            <option value="">Select category</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.category} (Rooms left: {cat.max_rooms})
              </option>
            ))}
          </select>
          {selectedCategory && (
            <div className="mt-2 text-sm">
              <span className="text-green-700 font-semibold">Empty: {categoryStats.empty}</span>
              <span className="mx-2">|</span>
              <span className="text-red-700 font-semibold">Filled: {categoryStats.filled}</span>
              <span className="mx-2">|</span>
              <span>Total: {categoryStats.total}</span>
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">How many rooms to book?</label>
          <input
            type="number"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded"
            value={roomCount}
            onChange={e => setRoomCount(Number(e.target.value))}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors disabled:opacity-60"
          disabled={loading || !selectedCategory || roomCount < 1}
        >
          {loading ? "Booking..." : "Book Room"}
        </button>
      </form>
      {bookingResult && bookingResult.rooms && (
        <div className="mt-6 p-4 bg-green-100 rounded text-green-800">
          <div>Booked {bookingResult.rooms.length} room(s):</div>
          <ul className="list-disc ml-6">
            {bookingResult.rooms.map((room, idx) => (
              <li key={room._id || idx}>
                <b>{room.title}</b> (Room number: <b>{room.room_number}</b>)
              </li>
            ))}
          </ul>
          <div>Rooms left in category: <b>{bookingResult.rooms_left}</b></div>
        </div>
      )}
      {bookingResult && bookingResult.room && (
        <div className="mt-6 p-4 bg-green-100 rounded text-green-800">
          <div>Room booked: <b>{bookingResult.room?.title}</b></div>
          <div>Room number: <b>{bookingResult.room?.room_number}</b></div>
          <div>Rooms left in category: <b>{bookingResult.rooms_left}</b></div>
        </div>
      )}
      {error && (
        <div className="mt-6 p-4 bg-red-100 rounded text-red-800">{error}</div>
      )}
    </div>
  );
};

export default RoomBookingAdmin;
