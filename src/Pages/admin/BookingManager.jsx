import React, { useState, useEffect } from 'react';

const BookingManager = () => {
  const [categories, setCategories] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchBookings();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories/all');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setCategories([]);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/bookings/all');
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setBookings([]);
    }
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
      const res = await fetch('http://localhost:5000/api/bookings/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: selectedCategory, count: Number(count) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');
      setSuccess(`Booked room(s): ${data.roomNumbers ? data.roomNumbers.join(', ') : ''}`);
      setSelectedCategory('');
      setCount(1);
      fetchBookings();
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleUnbook = async (bookingId) => {
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

  const handlePermanentDelete = async (bookingId) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/permanent-delete/${bookingId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to permanently delete booking');
      setSuccess('Booking permanently deleted');
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
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">No bookings yet.</td>
              </tr>
            ) : (
              bookings.map(b => (
                <tr key={b._id}>
                  <td className="py-2 px-4 border-b">{b.category?.name || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{b.roomNumber}</td>
                  <td className="py-2 px-4 border-b">{new Date(b.createdAt).toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">
  <div className="flex gap-x-2">
    <button
      onClick={() => handleUnbook(b._id)}
      className="px-3 py-1 rounded bg-yellow-600 text-white font-semibold hover:bg-yellow-700 transition disabled:opacity-50"
      disabled={loading}
    >
      Unbook
    </button>
    <button
      onClick={() => handlePermanentDelete(b._id)}
      className="px-3 py-1 rounded bg-red-700 text-white font-semibold hover:bg-red-800 transition disabled:opacity-50"
      disabled={loading}
    >
      Delete
    </button>
  </div>
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
