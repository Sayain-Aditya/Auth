import React, { useState, useEffect } from 'react';

const PantryItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

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

  const generateLowStockInvoice = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/pantry/invoice/low-stock', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to generate invoice');
      const data = await response.json();
      setInvoice(data.invoice);
      setShowInvoice(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const lowStockCount = items.filter(item => item.currentStock <= 20).length;

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
      <div className="bg-gray-100 p-4 rounded-t-lg flex justify-between items-center">
        <h5 className="font-medium">Pantry Items</h5>
        {lowStockCount > 0 && (
          <button
            onClick={generateLowStockInvoice}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition"
          >
            Generate Low Stock Invoice ({lowStockCount})
          </button>
        )}
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
                    {item.currentStock <= 20 ? (
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
      
      {/* Invoice Modal */}
      {showInvoice && invoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Low Stock Items Invoice</h2>
                <div className="flex gap-2">
                  <button
                    onClick={printInvoice}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Print
                  </button>
                  <button
                    onClick={() => setShowInvoice(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <p><strong>Invoice Number:</strong> {invoice.invoiceNumber}</p>
                <p><strong>Generated Date:</strong> {new Date(invoice.generatedDate).toLocaleDateString()}</p>
                <p><strong>Total Items:</strong> {invoice.totalItems}</p>
              </div>
              
              <table className="w-full border-collapse border border-gray-300 mb-6">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Item Name</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Current Stock</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Min Level</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Shortfall</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Unit</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Est. Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.category}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{item.currentStock}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{item.minStockLevel}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right text-red-600">{item.shortfall}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.unit}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">₹{item.totalCost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan="6" className="border border-gray-300 px-4 py-2 text-right">Total Estimated Cost:</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">₹{invoice.totalEstimatedCost.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PantryItemList;