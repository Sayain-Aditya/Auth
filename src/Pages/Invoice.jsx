import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { RiPhoneFill, RiMailFill } from 'react-icons/ri';
import axios from 'axios';

export default function Invoice() {
  const location = useLocation();
  const { checkoutId } = useParams();
  const bookingData = location.state?.bookingData;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [invoiceData, setInvoiceData] = useState({
    invoiceDetails: {
      billNo: '',
      billDate: '',
      grcNo: '',
      roomNo: '',
      roomType: '',
      pax: 2,
      adult: 2,
      checkInDate: '',
      checkOutDate: ''
    },
    clientDetails: {
      name: '',
      address: '',
      city: '',
      company: ':',
      gstin: '09COJPP9995B1Z3',
      mobileNo: '',
      nationality: 'Indian'
    },
    items: [],
    taxes: [],
    payment: {
      taxableAmount: 0,
      cgst: 0,
      sgst: 0,
      total: 0
    },
    otherCharges: []
  });

  const fetchInvoiceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get(`http://localhost:5000/api/checkout/${checkoutId}/invoice`, { headers });
      
      if (response.data.success) {
        setInvoiceData(response.data.invoice);
      } else {
        setError('Failed to fetch invoice data');
      }
    } catch (error) {
      console.error('Invoice API Error:', error);
      setError('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (checkoutId) {
      fetchInvoiceData();
    } else if (bookingData) {
      const currentDate = new Date().toLocaleDateString('en-GB');
      const billNo = `P${Date.now().toString().slice(-10)}`;
      
      setInvoiceData(prevData => ({
        ...prevData,
        invoiceDetails: {
          ...prevData.invoiceDetails,
          billNo: billNo,
          billDate: currentDate,
          grcNo: bookingData.grcNo || 'N/A',
          roomNo: bookingData.roomNumber || 'N/A',
          checkInDate: bookingData.checkInDate ? new Date(bookingData.checkInDate).toLocaleDateString('en-GB') : 'N/A',
          checkOutDate: bookingData.checkOutDate ? new Date(bookingData.checkOutDate).toLocaleDateString('en-GB') : 'N/A'
        },
        clientDetails: {
          ...prevData.clientDetails,
          name: bookingData.name || 'N/A',
          address: bookingData.address || 'N/A',
          city: bookingData.city || 'N/A',
          mobileNo: bookingData.mobileNo || 'N/A'
        }
      }));
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [checkoutId, bookingData]);

  const calculateTotal = () => {
    const subTotal = invoiceData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    return subTotal.toFixed(2);
  };
  
  const calculateOtherChargesTotal = () => {
    const total = invoiceData.otherCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
    return total.toFixed(2);
  };

  const calculateNetTotal = () => {
    const itemsTotal = invoiceData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const otherChargesTotal = invoiceData.otherCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
    const roundOff = -0.01;
    return (itemsTotal + otherChargesTotal + roundOff).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-2 sm:p-4">
      <div className="max-w-7xl mx-auto border-2 border-black p-2 sm:p-4">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="border border-black p-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 flex items-center justify-center">
                <span className="text-xs font-bold">LOGO</span>
              </div>
            </div>
            <div className="text-xs text-center sm:text-left">
              <p className="font-bold text-sm sm:text-base">BUDDHA AVENUE</p>
              <p className="text-xs">Buddha Avenue,H.N Singh Chauraha, Medical College Road,</p>
              <p className="text-xs">Basahichpur, GORAKHPUR - 273004</p>
              <p className="text-xs">Website: <a href="http://buddhaavenue.in" className="text-blue-600">buddhaavenue.in</a></p>
              <p className="text-xs">team@buddhaavenue.in</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="text-xs flex items-center space-x-2">
                <RiPhoneFill className="text-lg text-yellow-600" />
                <span>0551.3510264</span>
            </div>
            <div className="text-xs flex items-center space-x-2">
                <RiMailFill className="text-lg text-yellow-600" />
                <span>team@buddhaavenue.in</span>
            </div>
          </div>
        </div>

        <div className="text-center font-bold text-lg mb-4">
          TAX INVOICE
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 text-xs border border-black mb-4">
          <div className="border-r border-black p-2">
            <p><span className="font-bold">GSTIN No.:</span>{invoiceData.clientDetails.gstin}</p>
            <div className="grid grid-cols-3 gap-y-1">
              <p className="col-span-1">Name</p>
              <p className="col-span-2">:{invoiceData.clientDetails.name}</p>
              <p className="col-span-1">Address</p>
              <p className="col-span-2">:{invoiceData.clientDetails.address}</p>
              <p className="col-span-1">City</p>
              <p className="col-span-2">:{invoiceData.clientDetails.city}</p>
              <p className="col-span-1">Company</p>
              <p className="col-span-2">:{invoiceData.clientDetails.company}</p>
              <p className="col-span-1">Mobile No.</p>
              <p className="col-span-2">:{invoiceData.clientDetails.mobileNo}</p>
            </div>
          </div>

          <div className="p-2">
            <div className="grid grid-cols-2 gap-y-1">
              <p className="font-bold">Bill No. & Date</p>
              <p className="font-medium">:{invoiceData.invoiceDetails.billNo} {invoiceData.invoiceDetails.billDate}</p>
              <p className="font-bold">GRC No.</p>
              <p className="font-medium">:{invoiceData.invoiceDetails.grcNo}</p>
              <p className="font-bold">Room No./Type</p>
              <p className="font-medium">:{invoiceData.invoiceDetails.roomNo} {invoiceData.invoiceDetails.roomType}</p>
              <p className="font-bold">PAX</p>
              <p className="font-medium">:{invoiceData.invoiceDetails.pax} Adult: {invoiceData.invoiceDetails.adult}</p>
              <p className="font-bold">CheckIn Date</p>
              <p className="font-medium">:{invoiceData.invoiceDetails.checkInDate}</p>
              <p className="font-bold">CheckOut Date</p>
              <p className="font-medium">:{invoiceData.invoiceDetails.checkOutDate}</p>
            </div>
          </div>
        </div>

        <div className="mb-4 overflow-x-auto">
          <table className="w-full min-w-[800px] text-xs border-collapse">
            <thead>
              <tr className="border border-black bg-gray-200">
                <th className="p-1 border border-black whitespace-nowrap">Date</th>
                <th className="p-1 border border-black whitespace-nowrap">Particulars</th>
                <th className="p-1 border border-black text-center whitespace-nowrap">PAX</th>
                <th className="p-1 border border-black text-right whitespace-nowrap">Declared Rate</th>
                <th className="p-1 border border-black text-center whitespace-nowrap">HSN/SAC Code</th>
                <th className="p-1 border border-black text-right whitespace-nowrap">Rate</th>
                <th className="p-1 border border-black text-right whitespace-nowrap">CGST Rate</th>
                <th className="p-1 border border-black text-right whitespace-nowrap">SGST Rate</th>
                <th className="p-1 border border-black text-right whitespace-nowrap">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, index) => (
                <tr key={index} className="border border-black">
                  <td className="p-1 border border-black">{item.date}</td>
                  <td className="p-1 border border-black">{item.particulars}</td>
                  <td className="p-1 border border-black text-center">{item.pax}</td>
                  <td className="p-1 border border-black text-right">₹{item.declaredRate?.toFixed(2)}</td>
                  <td className="p-1 border border-black text-center">{item.hsn}</td>
                  <td className="p-1 border border-black text-right">{item.rate}%</td>
                  <td className="p-1 border border-black text-right">₹{item.cgstRate?.toFixed(2)}</td>
                  <td className="p-1 border border-black text-right">₹{item.sgstRate?.toFixed(2)}</td>
                  <td className="p-1 border border-black text-right font-bold">₹{item.amount?.toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="3" className="p-1 text-right font-bold">SUB TOTAL :</td>
                <td className="p-1 text-right border-l border-black font-bold">{invoiceData.taxes[0]?.taxableAmount?.toFixed(2)}</td>
                <td className="p-1 border-l border-black font-bold"></td>
                <td className="p-1 text-right border-l border-black font-bold"></td>
                <td className="p-1 text-right border-l border-black font-bold">{invoiceData.taxes[0]?.cgst?.toFixed(2)}</td>
                <td className="p-1 text-right border-l border-black font-bold">{invoiceData.taxes[0]?.sgst?.toFixed(2)}</td>
                <td className="p-1 text-right border-l border-black font-bold">{calculateTotal()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-2">
          <div className="flex flex-col lg:flex-row lg:justify-between text-xs space-y-4 lg:space-y-0">
            <div className="w-full lg:w-3/5 lg:pr-2">
              <p className="font-bold mb-1">Tax Before</p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-xs border-collapse border border-black">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-0.5 border border-black text-xs whitespace-nowrap">Tax%</th>
                      <th className="p-0.5 border border-black text-xs whitespace-nowrap">Txb.Amt</th>
                      <th className="p-0.5 border border-black text-xs whitespace-nowrap">CGST</th>
                      <th className="p-0.5 border border-black text-xs whitespace-nowrap">SGST</th>
                      <th className="p-0.5 border border-black text-xs whitespace-nowrap">Rec.No.</th>
                      <th className="p-0.5 border border-black text-xs whitespace-nowrap">PayType</th>
                      <th className="p-0.5 border border-black text-xs whitespace-nowrap">Rec.DL</th>
                      <th className="p-0.5 border border-black text-xs whitespace-nowrap">Rec.Amt</th>
                    </tr>
                  </thead>
                <tbody>
                  <tr>
                    <td className="p-0.5 border border-black text-center text-xs">12.00</td>
                    <td className="p-0.5 border border-black text-right text-xs">{invoiceData.payment?.taxableAmount?.toFixed(2)}</td>
                    <td className="p-0.5 border border-black text-right text-xs">{invoiceData.payment?.cgst?.toFixed(2)}</td>
                    <td className="p-0.5 border border-black text-right text-xs">{invoiceData.payment?.sgst?.toFixed(2)}</td>
                    <td className="p-0.5 border border-black text-center text-xs">1706</td>
                    <td className="p-0.5 border border-black text-center text-xs">CREDIT C</td>
                    <td className="p-0.5 border border-black text-center text-xs">{invoiceData.invoiceDetails.billDate}</td>
                    <td className="p-0.5 border border-black text-right text-xs">{invoiceData.payment?.total?.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="7" className="p-0.5 border border-black font-bold text-right text-xs">Total</td>
                    <td className="p-0.5 border border-black text-right font-bold text-xs">{invoiceData.payment?.total?.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              </div>
            </div>
            
            <div className="w-full lg:w-2/5 lg:pl-2">
              <div className="mb-2">
                <p className="font-bold mb-1">Net Amount Summary</p>
                <table className="w-full border-collapse border border-black">
                  <tbody>
                    <tr>
                      <td className="p-0.5 text-right text-xs font-medium">Amount:</td>
                      <td className="p-0.5 border-l border-black text-right text-xs">₹{invoiceData.taxes[0]?.amount?.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-0.5 text-right text-xs font-medium">SGST:</td>
                      <td className="p-0.5 border-l border-black text-right text-xs">₹{invoiceData.taxes[0]?.sgst?.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-0.5 text-right text-xs font-medium">CGST:</td>
                      <td className="p-0.5 border-l border-black text-right text-xs">₹{invoiceData.taxes[0]?.cgst?.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-0.5 text-right text-xs font-medium">Round Off:</td>
                      <td className="p-0.5 border-l border-black text-right text-xs">-0.01</td>
                    </tr>
                    <tr className="bg-gray-200">
                      <td className="p-0.5 font-bold text-right text-xs">NET AMOUNT:</td>
                      <td className="p-0.5 border-l border-black text-right font-bold text-xs">₹{calculateNetTotal()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <p className="font-bold mb-1">Other Charges</p>
                <table className="w-full border-collapse border border-black">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-0.5 border border-black text-xs">Particulars</th>
                      <th className="p-0.5 border border-black text-xs">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.otherCharges.map((charge, index) => (
                      <tr key={index}>
                        <td className="p-0.5 border border-black text-xs">{charge.particulars}</td>
                        <td className="p-0.5 border border-black text-right text-xs">₹{charge.amount?.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-200">
                      <td className="p-0.5 border border-black font-bold text-right text-xs">Total:</td>
                      <td className="p-0.5 border border-black text-right font-bold text-xs">₹{calculateOtherChargesTotal()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 border-b border-t border-black py-4">
            <div>
              <p className="font-bold">HAVE YOU DEPOSITED YOUR ROOM KEY AND LOCKERS KEY?</p>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" /> YES
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" /> NO
                </label>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold">CHECK OUT TIME : 12:00</p>
              <p>I AGREE THAT I AM RESPONSIBLE FOR THE FULL PAYMENT OF THIS BILL IN</p>
              <p>THE EVENTS, IF IT IS NOT PAID (BY THE COMPANY/ORGANISATION OR</p>
              <p>PERSON INDICATED)</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 mt-4 gap-2 sm:gap-0">
            <div className="text-left font-bold">FRONT OFFICE MANAGER</div>
            <div className="text-center font-bold">CASHIER</div>
            <div className="text-right font-bold">Guest Sign.</div>
            <div className="text-left text-xs">Subject to GORAKHPUR Jurisdiction only.</div>
            <div className="text-center text-xs">E. & O.E.</div>
            <div></div>
          </div>
          <p className="mt-4 text-center text-lg font-bold">Thank You, Visit Again</p>
        </div>
      </div>
    </div>
  );
}