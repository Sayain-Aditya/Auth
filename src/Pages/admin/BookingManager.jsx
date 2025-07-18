import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookingManager = () => {
  const [categories, setCategories] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchBookings();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/categories/all');
      setCategories(res.data);
    } catch (err) {
      setCategories([]);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bookings/all');
      setBookings(res.data);
    } catch (err) {
      setBookings([]);
    }
  };

  // Fetch rooms for selected category
  useEffect(() => {
    if (selectedCategory) {
      fetchRooms(selectedCategory);
    } else {
      setRooms([]);
    }
    // eslint-disable-next-line
  }, [selectedCategory]);

  const fetchRooms = async (categoryId) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/rooms/category/${categoryId}`);
      setRooms(res.data.rooms || []);
    } catch {
      setRooms([]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedCategory || !count || count < 1) {
      setError('Please select a category and enter a valid room count');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/bookings/book',
        { categoryId: selectedCategory, count: Number(count) },
        { headers: { Authorization: token ? `Bearer ${token}` : undefined } }
      );
      setSuccess('Booked room(s) successfully!');
      setSelectedCategory('');
      setCount(1);
      fetchBookings();
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setLoading(false);
  };

  // Book a specific room
  const handleBookRoom = async (roomId) => {
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
      fetchRooms(selectedCategory);
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (bookingId) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/delete/${bookingId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to unbook');
      setSuccess('Booking deleted (room unbooked)');
      fetchBookings();
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Booking Management</h2>
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Category</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Select --</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.name} (Available: {cat.maxRooms})
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Number of Rooms</label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            min={1}
            value={count}
            onChange={e => setCount(e.target.value)}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Booking...' : 'Book Room(s)'}
        </button>
        {error && <div className="text-red-600 mt-3">{error}</div>}
        {success && <div className="text-green-600 mt-3">{success}</div>}
      </form>
      {/* Show rooms for selected category */}
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
                <button
                  className={`mt-3 px-4 py-2 rounded ${room.canSelect ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-400 text-gray-100 cursor-not-allowed'}`}
                  disabled={!room.canSelect || loading}
                  onClick={() => handleBookRoom(room._id)}
                >
                  {room.isBooked ? 'Booked' : 'Book Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">All Bookings</h3>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Category</th>
              <th className="py-2 px-4 border-b text-left">Room Number</th>
              <th className="py-2 px-4 border-b text-left">Booked At</th>
              <th className="py-2 px-4 border-b text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr><td colSpan={4} className="py-4 text-center text-gray-500">No bookings yet.</td></tr>
            ) : (
              bookings.map(b => (
                <tr key={b._id}>
                  <td className="py-2 px-4 border-b">{b.category?.name || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{b.roomNumber}</td>
                  <td className="py-2 px-4 border-b">{new Date(b.createdAt).toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="px-4 py-1 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50"
                      disabled={loading}
                    >
                      Unbook
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingManager; 