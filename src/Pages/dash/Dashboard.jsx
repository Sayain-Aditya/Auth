import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const payload = token.split(".")[1];
    try {
      const decoded = JSON.parse(atob(payload));
      setUser({
        username: decoded.username || '',
        department: decoded.department,
        role: decoded.role,
      });
    } catch {
      setUser(null);
      localStorage.removeItem("token");
      navigate("/login");
    }
    setLoading(false);
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  const isReception =
    user.role === 'staff' && user.department?.name?.toLowerCase() === 'reception';
  const isAdmin = user.role === 'admin';

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Dashboard</h2>
      <div className="mb-4">
        <span className="font-semibold">Username:</span> {user.username}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Role:</span> {user.role}
      </div>
      <div>
        <span className="font-semibold">Department:</span>{" "}
        {user.department?.name || '-'}
      </div>

      {(isAdmin || isReception) && (
        <div className="mt-6">
          <button
            onClick={() => navigate("/admin/bookings")}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Manage Bookings
          </button>
          <button
            onClick={() => navigate("/admin/rooms")}
            className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            View Booked Rooms
          </button>
        </div>
      )}

      {!isAdmin && !isReception && (
        <div className="mt-6 text-sm text-red-500 text-center">
          🚫 You don't have access to bookings.
        </div>
      )}

      <button
        onClick={handleLogout}
        className="mt-6 w-full bg-gray-700 text-white py-2 rounded hover:bg-black transition"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
