import React, { useEffect, useState } from 'react';

const AuthDebug = ({ children }) => {
  const [authInfo, setAuthInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthInfo({ hasToken: false, error: 'No token found' });
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setAuthInfo({ 
        hasToken: true, 
        payload,
        tokenValid: true 
      });
    } catch (error) {
      setAuthInfo({ 
        hasToken: true, 
        tokenValid: false, 
        error: error.message 
      });
    }
  }, []);

  if (!authInfo) return <div>Loading...</div>;

  if (!authInfo.hasToken) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700">
        <h3>Authentication Debug</h3>
        <p>No token found in localStorage</p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (!authInfo.tokenValid) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700">
        <h3>Authentication Debug</h3>
        <p>Invalid token: {authInfo.error}</p>
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Clear Token & Login
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="p-2 bg-green-100 border border-green-400 text-green-700 text-sm mb-4">
        Authenticated as: {authInfo.payload.username || authInfo.payload.name} 
        ({authInfo.payload.role})
      </div>
      {children}
    </div>
  );
};

export default AuthDebug;