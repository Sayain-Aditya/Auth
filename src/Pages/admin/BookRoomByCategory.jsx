import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookRoomByCategory = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchRooms(selectedCategory);
    } else {
      setRooms([]);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/api/categories/all');
      setCategories(res.data);
    } catch {
      setCategories([]);
    }
    setLoading(false);
  };

  const fetchRooms = async (categoryId) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`http://localhost:5000/api/rooms/category/${categoryId}`);
      setRooms(res.data.rooms || []);
    } catch {
      setRooms([]);
    }
    setLoading(false);
  };

  const handleBook = async (roomNumber) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/bookings/book',
        { categoryId: selectedCategory, count: 1 },
        { headers: { Authorization: token ? `Bearer ${token}` : undefined } }
      );
      setSuccess('Room booked successfully!');
      await fetchRooms(selectedCategory);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setLoading(false);
  };

  const handleUnbook = async (roomNumber) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Find the booking for this room and category
      const bookingsRes = await axios.get('http://localhost:5000/api/bookings/all', {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      const booking = (bookingsRes.data || []).find(
        b => b.category && b.category._id === selectedCategory && String(b.roomNumber) === String(roomNumber) && b.isActive
      );
      if (!booking) throw new Error('Booking not found for this room');
      await axios.delete(`http://localhost:5000/api/bookings/delete/${booking._id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      setSuccess('Room unbooked successfully!');
      await fetchRooms(selectedCategory);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Book Room by Category</h2>
      <div className="mb-6">
        <label className="block mb-1 font-medium">Select Category</label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          disabled={loading}
        >
          <option value="">-- Select --</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>
      {rooms.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Rooms in {categories.find(c => c._id === selectedCategory)?.name || ''}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map(room => (
              <div key={room._id} className={`p-4 rounded shadow border ${room.isBooked ? 'bg-red-100 border-red-300' : 'bg-green-100 border-green-300'}`}>
                <div className="font-semibold">Room #{room.room_number}</div>
                <div>Status: {room.isBooked ? 'Booked' : 'Available'}</div>
                <div>Price: ₹{room.price}</div>
                <div>Description: {room.description || '-'}</div>
                <div className="flex gap-2 mt-3">
                  <button
                    className={`px-4 py-2 rounded ${room.canSelect ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-400 text-gray-100 cursor-not-allowed'}`}
                    disabled={!room.canSelect || loading}
                    onClick={() => handleBook(room.room_number)}
                  >
                    Book Now
                  </button>
                  {room.isBooked && (
                    <button
                      className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                      disabled={loading}
                      onClick={() => handleUnbook(room.room_number)}
                    >
                      Unbook
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {error && <div className="text-red-600 mt-3">{error}</div>}
      {success && <div className="text-green-600 mt-3">{success}</div>}
    </div>
  );
};

export default BookRoomByCategory;