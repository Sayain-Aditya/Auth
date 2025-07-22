import React, { useState, useRef } from 'react';
import axios from 'axios';

const HousekeepingPhotoUpload = ({ taskId }) => {
  const [beforeImages, setBeforeImages] = useState([]);
  const [afterImages, setAfterImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadType, setUploadType] = useState('before'); // 'before' or 'after'
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (uploadType === 'before') {
      setBeforeImages(files);
    } else {
      setAfterImages(files);
    }
  };

  // Upload a single file to Firebase via backend
  const uploadToFirebase = async (file, token) => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await axios.post(
      'http://localhost:5000/api/housekeeping/upload-photo',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.url;
  };

  const handleUpload = async () => {
    setUploading(true);
    setMessage('');
    setUploadProgress(0);
    try {
      const token = localStorage.getItem('token');
      const imagesToUpload = uploadType === 'before' ? beforeImages : afterImages;
      const uploadedUrls = [];
      for (let i = 0; i < imagesToUpload.length; i++) {
        setUploadProgress(Math.round(((i) / imagesToUpload.length) * 100));
        const url = await uploadToFirebase(imagesToUpload[i], token);
        uploadedUrls.push(url);
      }
      setUploadProgress(100);
      // Send image URLs to backend to associate with the task
      const taskEndpoint = `http://localhost:5000/api/housekeeping/tasks/${taskId}/images/${uploadType}`;
      await axios.post(taskEndpoint, { imageUrls: uploadedUrls }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(`${uploadType === 'before' ? 'Before' : 'After'} cleaning photos uploaded successfully!`);
      // Clear the selected files
      if (uploadType === 'before') {
        setBeforeImages([]);
      } else {
        setAfterImages([]);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Upload error:', err);
      setMessage(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow mt-4">
      <h3 className="text-lg font-semibold mb-3">Room Photos</h3>
      {message && (
        <div className={`p-2 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
      <div className="mb-4">
        <div className="flex space-x-2 mb-3">
          <button
            type="button"
            onClick={() => setUploadType('before')}
            className={`px-3 py-1 rounded ${uploadType === 'before' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Before Cleaning
          </button>
          <button
            type="button"
            onClick={() => setUploadType('after')}
            className={`px-3 py-1 rounded ${uploadType === 'after' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            After Cleaning
          </button>
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-2 border rounded"
          ref={fileInputRef}
        />
        <div className="mt-2 text-sm text-gray-600">
          {uploadType === 'before' ? 
            `${beforeImages.length} files selected` : 
            `${afterImages.length} files selected`}
        </div>
      </div>
      <button
        onClick={handleUpload}
        disabled={uploading || (uploadType === 'before' ? !beforeImages.length : !afterImages.length)}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
      >
        {uploading ? `Uploading... ${Math.round(uploadProgress)}%` : `Upload ${uploadType === 'before' ? 'Before' : 'After'} Photos`}
      </button>
      {/* Progress bar */}
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
      {/* Preview section */}
      {(uploadType === 'before' ? beforeImages : afterImages).length > 0 && (
        <div className="mt-4">
          <h4 className="text-md font-medium mb-2">Preview:</h4>
          <div className="grid grid-cols-3 gap-2">
            {(uploadType === 'before' ? beforeImages : afterImages).map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HousekeepingPhotoUpload;