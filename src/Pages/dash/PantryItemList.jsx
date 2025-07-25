import React, { useState, useEffect } from 'react';

const PantryItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPantryItems();
  }, []);

  const fetchPantryItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/pantry/items', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch pantry items');
      const data = await response.json();
      setItems(data.items || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-red-600">
        <h5 className="text-lg font-medium">Error: {error}</h5>
        <button 
          className="mt-3 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
          onClick={fetchPantryItems}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="bg-gray-100 p-4 rounded-t-lg">
        <h5 className="font-medium">Pantry Items</h5>
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Unit</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-4 text-center text-gray-500">No pantry items found</td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.currentStock}</td>
                  <td className="px-4 py-3">{item.unit}</td>
                  <td className="px-4 py-3">
                    {item.isLowStock ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        In Stock
                      </span>
                    )}
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

export default PantryItemList;