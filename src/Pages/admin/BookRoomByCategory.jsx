
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookRoomByCategory = () => {
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Multi-booking form state
  const [bookingForms, setBookingForms] = useState([
    { categoryId: '', count: 1, guestName: '', guestPhone: '', guestEmail: '' }
  ]);

  // Add another booking form section
  const addBookingForm = () => {
    setBookingForms(forms => ([...forms, { categoryId: '', count: 1, guestName: '', guestPhone: '', guestEmail: '' }]));
  };

  // Remove a booking form section
  const removeBookingForm = (idx) => {
    setBookingForms(forms => forms.length > 1 ? forms.filter((_, i) => i !== idx) : forms);
  };

  // Handle change in any booking form section
  const handleBookingFormChange = (idx, e) => {
    const { name, value } = e.target;
    setBookingForms(forms => forms.map((f, i) => i === idx ? { ...f, [name]: name === 'count' ? Number(value) : value } : f));
  };
  // Handle booking form input
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Multi-booking form submit handler
  const handleMultiBookingForm = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Validate all forms
      for (const form of bookingForms) {
        if (!form.categoryId) throw new Error('Please select a category for each booking');
        if (!form.guestName || !form.guestPhone) throw new Error('Please fill guest name and phone for each booking');
        if (!form.count || form.count < 1) throw new Error('Room count must be at least 1');
      }
      const token = localStorage.getItem('token');
      const bookingsPayload = bookingForms.map(form => ({
        categoryId: form.categoryId,
        count: form.count,
        guestDetails: {
          name: form.guestName
        },
        contactDetails: {
          phone: form.guestPhone,
          email: form.guestEmail
        }
      }));
      await axios.post(
        'http://localhost:5000/api/bookings/book',
        { bookings: bookingsPayload },
        { headers: { Authorization: token ? `Bearer ${token}` : undefined } }
      );
      setSuccess('Rooms booked successfully!');
      setBookingForms([{ categoryId: '', count: 1, guestName: '', guestPhone: '', guestEmail: '' }]);
      // Optionally refresh rooms for the first selected category
      if (bookingsPayload[0]?.categoryId) await fetchRooms(bookingsPayload[0].categoryId);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);



  // Only fetch rooms when the last selected category changes
  const lastSelectedCategory = bookingForms.length > 0 ? bookingForms[bookingForms.length - 1].categoryId : '';
  useEffect(() => {
    if (lastSelectedCategory) {
      fetchRooms(lastSelectedCategory);
    } else {
      setRooms([]);
    }
    // eslint-disable-next-line
  }, [lastSelectedCategory]);

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

  // Use last selected category for room actions
  const getLastSelectedCategory = () => bookingForms.length > 0 ? bookingForms[bookingForms.length - 1].categoryId : '';

  const handleBook = async (roomNumber) => {
    setError('');
    setSuccess('');
    setLoading(true);
    const lastCategory = getLastSelectedCategory();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/bookings/book',
        { categoryId: lastCategory, count: 1 },
        { headers: { Authorization: token ? `Bearer ${token}` : undefined } }
      );
      setSuccess('Room booked successfully!');
      await fetchRooms(lastCategory);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setLoading(false);
  };

  const handleUnbook = async (roomNumber) => {
    setError('');
    setSuccess('');
    setLoading(true);
    const lastCategory = getLastSelectedCategory();
    try {
      const token = localStorage.getItem('token');
      // Find the booking for this room and category
      const bookingsRes = await axios.get('http://localhost:5000/api/bookings/all', {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      const booking = (bookingsRes.data || []).find(
        b => b.category && b.category._id === lastCategory && String(b.roomNumber) === String(roomNumber) && b.isActive
      );
      if (!booking) throw new Error('Booking not found for this room');
      await axios.delete(`http://localhost:5000/api/bookings/delete/${booking._id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      setSuccess('Room unbooked successfully!');
      await fetchRooms(lastCategory);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Book Multiple Rooms (Different Categories)</h2>

      {/* Multi-Booking Form */}
      <form onSubmit={handleMultiBookingForm} className="mb-8 bg-white p-6 rounded-lg shadow">
        {bookingForms.map((form, idx) => (
          <div key={idx} className="mb-6 border-b pb-4 last:border-b-0 last:pb-0">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Room Request #{idx + 1}</span>
              {bookingForms.length > 1 && (
                <button type="button" onClick={() => removeBookingForm(idx)} className="text-red-500 text-sm">Remove</button>
              )}
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Select Category</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                name="categoryId"
                value={form.categoryId}
                onChange={e => handleBookingFormChange(idx, e)}
                disabled={loading}
                required
              >
                <option value="">-- Select --</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Number of Rooms</label>
              <input
                type="number"
                name="count"
                min={1}
                value={form.count}
                onChange={e => handleBookingFormChange(idx, e)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Guest Name</label>
              <input
                type="text"
                name="guestName"
                value={form.guestName}
                onChange={e => handleBookingFormChange(idx, e)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Guest Phone</label>
              <input
                type="text"
                name="guestPhone"
                value={form.guestPhone}
                onChange={e => handleBookingFormChange(idx, e)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Guest Email</label>
              <input
                type="email"
                name="guestEmail"
                value={form.guestEmail}
                onChange={e => handleBookingFormChange(idx, e)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                disabled={loading}
              />
            </div>
          </div>
        ))}
        <button type="button" onClick={addBookingForm} className="mb-4 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold">+ Add Another Room</button>
        <button
          type="submit"
          className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Booking...' : 'Book All Rooms'}
        </button>
      </form>

      {/* Room List */}
      {rooms.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Rooms in {categories.find(c => c._id === getLastSelectedCategory())?.name || ''}</h3>
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
