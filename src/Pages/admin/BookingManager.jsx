import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Label = ({ children }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);
const Input = ({ ...props }) => (
  <input {...props} className="w-full border rounded px-3 py-2 text-sm" />
);

const BookingForm = () => {
  const [categories, setCategories] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({
    category: '',
    count: 1,
    guestDetails: {
      name: '', age: '', gender: '', isVIP: false, anniversary: '',
      nationality: '', guestImage: ''
    },
    contactDetails: {
      phone: '', email: '', address: '', city: '', state: '', country: '', pinCode: ''
    },
    identityDetails: {
      idType: '', idNumber: '', idPhotoFront: '', idPhotoBack: ''
    },
    bookingInfo: {
      checkIn: '', checkOut: '', arrivalFrom: '', bookingType: '',
      purposeOfVisit: '', remarks: '', adults: 1, children: 0
    },
    paymentDetails: {
      totalAmount: '', advancePaid: '', paymentMode: '',
      billingName: '', billingAddress: '', gstNumber: ''
    }
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/categories/all')
      .then(res => res.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  
    fetch('http://localhost:5000/api/bookings/all', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBookings(data);
        else setBookings([]);
      })
      .catch(() => setBookings([]));
  }, []);
  

  const handleChange = (section, field, value) => {
    setForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const getAvailable = (categoryId) => {
    const cat = categories.find(c => c._id === categoryId);
    if (!cat) return 0;
    const booked = bookings
      .filter(b => b.category?._id === categoryId && b.isActive !== false)
      .reduce((sum, b) => sum + (b.count || 1), 0);
    return cat.maxRooms - booked;
  };

  const submitForm = async (e) => {
    e.preventDefault();

    const available = getAvailable(form.category);
    if (Number(form.count) > available) {
      alert(`❌ Only ${available} room(s) available`);
      return;
    }

    const payload = {
      ...form,
      categoryId: form.category,
      count: Number(form.count),
      numberOfRooms: Number(form.count),
    };

    try {
      const res = await fetch('http://localhost:5000/api/bookings/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload),
      });      

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Booking failed');
        return;
      }

      alert('✅ Booking successful');
      navigate('/admin/rooms');
    } catch (err) {
      alert('❌ Error submitting booking: ' + err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">New Booking</h2>
        <button
          onClick={() => navigate('/admin/rooms')}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-black"
        >
          View Bookings
        </button>
      </div>

      <form onSubmit={submitForm} className="bg-white p-6 rounded-lg shadow space-y-8">
        {/* Room Category */}
        <div>
          <Label>Room Category</Label>
          <select
            className="w-full border p-2 rounded"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Select Category</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>
                {c.name} (Available: {getAvailable(c._id)})
              </option>
            ))}
          </select>
        </div>

        {/* Room Count */}
        {form.category && (
  <div>
    <Label>Number of Rooms</Label>
    <select
      className="w-full border p-2 rounded"
      value={form.count}
      onChange={(e) => setForm({ ...form, count: Number(e.target.value) })}
    >
      {[...Array(getAvailable(form.category)).keys()].map(i => (
        <option key={i + 1} value={i + 1}>
          {i + 1}
        </option>
      ))}
    </select>
    <p className="text-sm text-gray-600 mt-1">
      Rooms available: {getAvailable(form.category)}
    </p>
  </div>
)}

        {/* Guest Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Guest Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><Label>Name</Label><Input value={form.guestDetails.name} onChange={(e) => handleChange('guestDetails', 'name', e.target.value)} /></div>
            <div><Label>Age</Label><Input type="number" value={form.guestDetails.age} onChange={(e) => handleChange('guestDetails', 'age', e.target.value)} /></div>
            <div>
              <Label>Gender</Label>
              <select className="w-full border p-2 rounded" value={form.guestDetails.gender} onChange={(e) => handleChange('guestDetails', 'gender', e.target.value)}>
                <option value="">Select</option><option>Male</option><option>Female</option>
              </select>
            </div>
            <div><Label>VIP Guest</Label><input type="checkbox" className="ml-2" checked={form.guestDetails.isVIP} onChange={(e) => handleChange('guestDetails', 'isVIP', e.target.checked)} /></div>
            <div><Label>Anniversary</Label><Input type="date" value={form.guestDetails.anniversary} onChange={(e) => handleChange('guestDetails', 'anniversary', e.target.value)} /></div>
            <div><Label>Nationality</Label><Input value={form.guestDetails.nationality} onChange={(e) => handleChange('guestDetails', 'nationality', e.target.value)} /></div>
            <div className="md:col-span-2"><Label>Guest Image URL</Label><Input value={form.guestDetails.guestImage} onChange={(e) => handleChange('guestDetails', 'guestImage', e.target.value)} /></div>
          </div>
        </div>

        {/* Contact Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Contact Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['phone', 'email', 'address', 'city', 'state', 'country', 'pinCode'].map(field => (
              <div key={field}><Label>{field}</Label><Input value={form.contactDetails[field]} onChange={(e) => handleChange('contactDetails', field, e.target.value)} /></div>
            ))}
          </div>
        </div>

        {/* Identity Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Identity Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>ID Type</Label>
              <select className="w-full border p-2 rounded" value={form.identityDetails.idType} onChange={(e) => handleChange('identityDetails', 'idType', e.target.value)}>
                <option value="">Select</option>
                <option>Aadhaar</option>
                <option>PAN</option>
                <option>Passport</option>
                <option>Driving License</option>
                <option>Voter ID</option>
                <option>Other</option>
              </select>
            </div>
            <div><Label>ID Number</Label><Input value={form.identityDetails.idNumber} onChange={(e) => handleChange('identityDetails', 'idNumber', e.target.value)} /></div>
            <div><Label>ID Front URL</Label><Input value={form.identityDetails.idPhotoFront} onChange={(e) => handleChange('identityDetails', 'idPhotoFront', e.target.value)} /></div>
            <div><Label>ID Back URL</Label><Input value={form.identityDetails.idPhotoBack} onChange={(e) => handleChange('identityDetails', 'idPhotoBack', e.target.value)} /></div>
          </div>
        </div>

        {/* Booking Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Booking Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Check-In</Label><Input type="datetime-local" value={form.bookingInfo.checkIn} onChange={(e) => handleChange('bookingInfo', 'checkIn', e.target.value)} /></div>
            <div><Label>Check-Out</Label><Input type="datetime-local" value={form.bookingInfo.checkOut} onChange={(e) => handleChange('bookingInfo', 'checkOut', e.target.value)} /></div>
            {['arrivalFrom', 'bookingType', 'purposeOfVisit', 'remarks'].map(field => (
              <div key={field}><Label>{field}</Label><Input value={form.bookingInfo[field]} onChange={(e) => handleChange('bookingInfo', field, e.target.value)} /></div>
            ))}
            <div><Label>Adults</Label><Input type="number" value={form.bookingInfo.adults} onChange={(e) => handleChange('bookingInfo', 'adults', e.target.value)} /></div>
            <div><Label>Children</Label><Input type="number" value={form.bookingInfo.children} onChange={(e) => handleChange('bookingInfo', 'children', e.target.value)} /></div>
          </div>
        </div>

        {/* Payment Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Payment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['totalAmount', 'advancePaid', 'billingName', 'billingAddress', 'gstNumber'].map(field => (
              <div key={field}><Label>{field}</Label><Input value={form.paymentDetails[field]} onChange={(e) => handleChange('paymentDetails', field, e.target.value)} /></div>
            ))}
            <div>
              <Label>Payment Mode</Label>
              <select className="w-full border p-2 rounded" value={form.paymentDetails.paymentMode} onChange={(e) => handleChange('paymentDetails', 'paymentMode', e.target.value)}>
                <option value="">Select</option>
                <option>Cash</option><option>Card</option><option>UPI</option><option>Bank Transfer</option><option>Other</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Submit Booking
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
