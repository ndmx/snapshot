import React, { useState } from 'react';
import { storage, db, auth } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './CreateModal.css';

function CreateModal({ onClose }) {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState('select'); // 'select' or 'details'

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setImage(file);
      setError('');
      setStep('details');
    }
  };

  const handleCameraCapture = (e) => {
    handleImageChange(e);
  };

  const handleUpload = async () => {
    if (!image) {
      setError('Please select an image');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const filename = `${Date.now()}_${image.name}`;
      const storageRef = ref(storage, `images/${filename}`);
      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(prog);
        },
        (error) => {
          setError(error.message);
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, 'posts'), {
            imageUrl: downloadURL,
            caption: caption,
            username: auth.currentUser.displayName || auth.currentUser.email,
            timestamp: serverTimestamp()
          });

          // Reset form and close modal
          setImage(null);
          setCaption('');
          setProgress(0);
          setUploading(false);
          setStep('select');
          
          // Close modal and ensure user sees the feed
          setTimeout(() => {
            onClose();
          }, 100);
        }
      );
    } catch (error) {
      setError(error.message);
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{step === 'select' ? 'Create new post' : 'Add details'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {step === 'select' ? (
          <div className="modal-body select-step">
            <svg width="96" height="77" viewBox="0 0 96 77" fill="none">
              <path d="M43.5 44.5C43.5 46.9853 45.5147 49 48 49C50.4853 49 52.5 46.9853 52.5 44.5C52.5 42.0147 50.4853 40 48 40C45.5147 40 43.5 42.0147 43.5 44.5Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M1.5 61.5V8.5C1.5 4.35786 4.85786 1 9 1H87C91.1421 1 94.5 4.35786 94.5 8.5V61.5C94.5 65.6421 91.1421 69 87 69H9C4.85786 69 1.5 65.6421 1.5 61.5Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M18 69L39.5 47.5L56.5 64.5L70 51L94.5 75.5" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <h3>Drag photos and videos here</h3>
            <div className="upload-options">
              <label htmlFor="file-input-modal" className="select-button">
                Select from computer
              </label>
              <label htmlFor="camera-input-modal" className="select-button camera-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                Take Photo
              </label>
            </div>
            <input
              id="file-input-modal"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <input
              id="camera-input-modal"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className="modal-body details-step">
            <div className="details-left">
              <div className="image-preview-modal">
                <img src={URL.createObjectURL(image)} alt="Preview" />
              </div>
            </div>
            <div className="details-right">
              <div className="user-info-modal">
                <div className="user-avatar-modal">
                  {auth.currentUser.displayName ? auth.currentUser.displayName[0].toUpperCase() : 'U'}
                </div>
                <span className="username-modal">
                  {auth.currentUser.displayName || auth.currentUser.email}
                </span>
              </div>
              
              <textarea
                className="caption-textarea"
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                disabled={uploading}
                maxLength="2200"
              />

              {progress > 0 && progress < 100 && (
                <div className="progress-bar-modal">
                  <div className="progress-fill-modal" style={{ width: `${progress}%` }} />
                </div>
              )}

              {error && <p className="error-modal">{error}</p>}

              <button 
                className="share-button"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? 'Sharing...' : 'Share'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateModal;

