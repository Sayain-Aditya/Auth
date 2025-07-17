import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CustomerList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/bookings/all', {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      setBookings(res.data || []);
    } catch (err) {
      setError('Failed to fetch customer bookings');
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Customer Details</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Guest Name</th>
              <th className="py-2 px-4 border-b text-left">Phone</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Category</th>
              <th className="py-2 px-4 border-b text-left">Room Number</th>
              <th className="py-2 px-4 border-b text-left">Booked At</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-4 text-center text-gray-500">Loading...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={7} className="py-4 text-center text-gray-500">No customer bookings found.</td></tr>
            ) : (
              bookings.map((b, idx) => (
                <tr key={b._id || idx}>
                  <td className="py-2 px-4 border-b">{b.guestDetails?.name || '-'}</td>
                  <td className="py-2 px-4 border-b">{b.contactDetails?.phone || '-'}</td>
                  <td className="py-2 px-4 border-b">{b.contactDetails?.email || '-'}</td>
                  <td className="py-2 px-4 border-b">{b.category?.name || '-'}</td>
                  <td className="py-2 px-4 border-b">{b.roomNumber || '-'}</td>
                  <td className="py-2 px-4 border-b">{b.createdAt ? new Date(b.createdAt).toLocaleString() : '-'}</td>
                  <td className="py-2 px-4 border-b">{b.isActive ? 'Active' : 'Inactive'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerList;
