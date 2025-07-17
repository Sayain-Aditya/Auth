import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoomManager = () => {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    category: '',
    room_number: '',
    price: '',
    exptra_bed: false,
    is_reserved: false,
    status: 'available',
    description: '',
    images: ''
  });
  const [summary, setSummary] = useState([]);
  const [allocatedRoomNumber, setAllocatedRoomNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRooms();
    fetchCategories();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/rooms/all');
      setRooms(res.data);
    } catch {
      setRooms([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/categories/all');
      setCategories(res.data);
    } catch {
      setCategories([]);
    }
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/rooms/add',
        {
          ...form,
          images: form.images ? form.images.split(',').map(s => s.trim()) : []
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined
          }
        }
      );
      setSuccess('Room created!');
      setSummary(res.data.summary || []);
      setAllocatedRoomNumber(res.data.allocatedRoomNumber || '');
      setForm({
        title: '',
        category: '',
        room_number: '',
        price: '',
        exptra_bed: false,
        is_reserved: false,
        status: 'available',
        description: '',
        images: ''
      });
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Room Management</h2>
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <label className="block mb-1 font-medium">Title</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full px-3 py-2 border rounded" required disabled={loading} />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Category</label>
          <select name="category" value={form.category} onChange={handleChange} className="w-full px-3 py-2 border rounded" required disabled={loading}>
            <option value="">-- Select --</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Room Number</label>
          <input type="text" name="room_number" value={form.room_number} onChange={handleChange} className="w-full px-3 py-2 border rounded" required disabled={loading} />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Price</label>
          <input type="number" name="price" value={form.price} onChange={handleChange} className="w-full px-3 py-2 border rounded" required disabled={loading} />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Extra Bed</label>
          <input type="checkbox" name="exptra_bed" checked={form.exptra_bed} onChange={handleChange} className="ml-2" disabled={loading} />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Reserved</label>
          <input type="checkbox" name="is_reserved" checked={form.is_reserved} onChange={handleChange} className="ml-2" disabled={loading} />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 border rounded" required disabled={loading}>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full px-3 py-2 border rounded" disabled={loading} />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Images (comma separated URLs)</label>
          <input type="text" name="images" value={form.images} onChange={handleChange} className="w-full px-3 py-2 border rounded" disabled={loading} />
        </div>
        <button type="submit" className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50" disabled={loading}>
          {loading ? 'Creating...' : 'Create Room'}
        </button>
        {error && <div className="text-red-600 mt-3">{error}</div>}
        {success && <div className="text-green-600 mt-3">{success}</div>}
      </form>
      {allocatedRoomNumber && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
          <strong>Allocated Room Number:</strong> {allocatedRoomNumber}
        </div>
      )}
      {summary.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Room Summary by Category</h3>
          <table className="w-full bg-white rounded-lg shadow border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Category</th>
                <th className="py-2 px-4 border-b text-left">Count</th>
                <th className="py-2 px-4 border-b text-left">Room Numbers</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((cat, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-4 border-b">{cat.category}</td>
                  <td className="py-2 px-4 border-b">{cat.count}</td>
                  <td className="py-2 px-4 border-b">{cat.roomNumbers.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">All Rooms</h3>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Title</th>
              <th className="py-2 px-4 border-b text-left">Category</th>
              <th className="py-2 px-4 border-b text-left">Room Number</th>
              <th className="py-2 px-4 border-b text-left">Price</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr><td colSpan={5} className="py-4 text-center text-gray-500">No rooms yet.</td></tr>
            ) : (
              rooms.map(room => (
                <tr key={room._id}>
                  <td className="py-2 px-4 border-b">{room.title}</td>
                  <td className="py-2 px-4 border-b">{room.category?.name || room.category || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{room.room_number}</td>
                  <td className="py-2 px-4 border-b">{room.price}</td>
                  <td className="py-2 px-4 border-b">{room.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomManager;
