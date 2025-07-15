import React, { useEffect, useState } from 'react';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);

  const fetchRooms = () => {
    fetch('http://localhost:5000/api/bookings/all', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRooms(data);
        } else {
          setRooms([]);
        }
      })
      .catch(() => setRooms([]));
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const token = localStorage.getItem("token");
  let role = '';
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      role = payload?.role || '';
    } catch (err) {
      console.warn("Failed to parse token:", err);
    }
  }  

  const handleUnbook = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to unbook');
        return;
      }

      alert(data.message || '✅ Room unbooked successfully');
      fetchRooms();
    } catch (err) {
      alert('❌ Error unbooking: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this booking?");
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:5000/api/bookings/permanent-delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || 'Delete failed');
      alert('🗑️ Booking deleted');
      fetchRooms();
    } catch (err) {
      alert('❌ Error deleting: ' + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Booked Rooms</h2>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Room No.</th>
              <th className="p-3">Ref No.</th>
              <th className="p-3">Category</th>
              <th className="p-3">Guest</th>
              <th className="p-3">Check-In</th>
              <th className="p-3">Check-Out</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(rooms) && rooms.map(r => (
              <tr key={r._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{r.roomNumber}</td>
                <td className="p-3">{r.referenceNumber}</td>
                <td className="p-3">{r.category?.name}</td>
                <td className="p-3">{r.guestDetails?.name}</td>
                <td className="p-3">{r.bookingInfo?.checkIn?.slice(0, 10)}</td>
                <td className="p-3">{r.bookingInfo?.checkOut?.slice(0, 10)}</td>
                <td className="p-3 space-x-2">
  <button
    onClick={() => handleUnbook(r._id)}
    className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
  >
    Unbook
  </button>

  {role === 'admin' && (
    <button
      onClick={() => handleDelete(r._id)}
      className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
    >
      Delete
    </button>
  )}
</td>
              </tr>
            ))}
            {rooms.length === 0 && (
              <tr><td colSpan="7" className="text-center p-4 text-gray-500">No bookings found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomList;
