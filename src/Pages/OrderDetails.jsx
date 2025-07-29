import React, { useState } from 'react';

const OrderDetails = () => {
  const [orderId, setOrderId] = useState('');
  const [tableNo, setTableNo] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/restaurant-orders/details/${orderId}`);
      const data = await response.json();
      setOrderData(data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const fetchOrdersByTable = async () => {
    if (!tableNo) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/restaurant-orders/table/${tableNo}`);
      const data = await response.json();
      setOrderData(data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const generateInvoice = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/restaurant-orders/invoice/${orderId}`);
      const data = await response.json();
      setInvoice(data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Restaurant Order Management</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Enter Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button onClick={fetchOrderDetails} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Get Order Details
        </button>
        <button onClick={generateInvoice} style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
          Generate Invoice
        </button>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Enter Table Number"
          value={tableNo}
          onChange={(e) => setTableNo(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button onClick={fetchOrdersByTable} style={{ padding: '8px 16px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px' }}>
          Get Table Orders
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {orderData && !Array.isArray(orderData) && (
        <div style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> {orderData._id}</p>
          <p><strong>Table:</strong> {orderData.tableNo}</p>
          <p><strong>Staff:</strong> {orderData.staffName}</p>
          <p><strong>Phone:</strong> {orderData.phoneNumber}</p>
          <p><strong>Status:</strong> {orderData.status}</p>
          <p><strong>Amount:</strong> ₹{orderData.amount}</p>
          <h4>Items:</h4>
          {orderData.items?.map((item, index) => (
            <div key={index} style={{ marginLeft: '20px' }}>
              <p>{item.itemId.name} - Qty: {item.quantity} - Price: ₹{item.itemId.Price}</p>
            </div>
          ))}
        </div>
      )}

      {orderData && Array.isArray(orderData) && (
        <div>
          <h3>Table Orders</h3>
          {orderData.map((order) => (
            <div key={order._id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Amount:</strong> ₹{order.amount}</p>
              <p><strong>Items:</strong> {order.items?.length} items</p>
            </div>
          ))}
        </div>
      )}

      {invoice && (
        <div style={{ border: '2px solid #007bff', padding: '20px', marginTop: '20px', borderRadius: '5px', backgroundColor: '#f8f9fa' }}>
          <h2>INVOICE</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p><strong>Order ID:</strong> {invoice.orderId}</p>
              <p><strong>Table:</strong> {invoice.tableNo}</p>
              <p><strong>Staff:</strong> {invoice.staffName}</p>
            </div>
            <div>
              <p><strong>Date:</strong> {new Date(invoice.createdAt).toLocaleDateString()}</p>
              <p><strong>Phone:</strong> {invoice.phoneNumber}</p>
            </div>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
            <thead>
              <tr style={{ backgroundColor: '#e9ecef' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Item</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Price</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Qty</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Discount</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.name}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>₹{item.price}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{item.quantity}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{item.discount}%</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>₹{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div style={{ textAlign: 'right', marginTop: '20px' }}>
            <p><strong>Subtotal: ₹{invoice.subtotal?.toFixed(2)}</strong></p>
            <p>Order Discount ({invoice.orderDiscount}%): -₹{invoice.orderDiscountAmount?.toFixed(2)}</p>
            <h3>Final Amount: ₹{invoice.finalAmount?.toFixed(2)}</h3>
          </div>
          
          <button 
            onClick={() => window.print()} 
            style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', marginTop: '10px' }}
          >
            Print Invoice
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;