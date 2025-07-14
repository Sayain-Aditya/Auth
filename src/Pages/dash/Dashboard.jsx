import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
    // Decode token to get user info (simple way, not secure for sensitive data)
    const payload = token.split(".")[1];
    try {
      const decoded = JSON.parse(atob(payload));
      setUser({
        username: decoded.username || decoded.name || decoded.id || '',
        department: decoded.department,
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Dashboard</h2>
      <div className="mb-4">
        <span className="font-semibold">Username:</span> {user.username}
      </div>
      <div>
        <span className="font-semibold">Department Number(s):</span> {Array.isArray(user.department)
          ? user.department.map(dep => dep.id || dep).join(", ")
          : (user.department?.id || user.department || '')}
      </div>
        <button
            onClick={handleLogout}
            className="mt-6 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition">
            Logout
        </button>
    </div>
  );
};

export default Dashboard;