import React, { useState } from 'react';
import { storage, db, auth } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './Upload.css';

function Upload() {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setImage(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!image) {
      setError('Please select an image');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Create a unique filename
      const filename = `${Date.now()}_${image.name}`;
      const storageRef = ref(storage, `images/${filename}`);

      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress
          const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(prog);
        },
        (error) => {
          setError(error.message);
          setUploading(false);
        },
        async () => {
          // Upload completed, get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Save photo metadata to Firestore
          await addDoc(collection(db, 'posts'), {
            imageUrl: downloadURL,
            caption: caption,
            username: auth.currentUser.displayName || auth.currentUser.email,
            timestamp: serverTimestamp()
          });

          // Reset form
          setImage(null);
          setCaption('');
          setProgress(0);
          setUploading(false);

          // Reset file input
          document.getElementById('file-input').value = '';
        }
      );
    } catch (error) {
      setError(error.message);
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-box">
        <h2>Upload Photo</h2>
        <div className="upload-form">
          <label htmlFor="file-input" className="file-input-label">
            {image ? (
              <img 
                src={URL.createObjectURL(image)} 
                alt="Preview" 
                className="image-preview"
              />
            ) : (
              <div className="file-placeholder">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <p>Click to select an image</p>
              </div>
            )}
          </label>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input"
          />
          
          <input
            type="text"
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="caption-input"
            disabled={uploading}
          />

          {progress > 0 && progress < 100 && (
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}>
                {progress}%
              </div>
            </div>
          )}

          {error && <p className="upload-error">{error}</p>}

          <button 
            onClick={handleUpload} 
            disabled={!image || uploading}
            className="upload-button"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Upload;

