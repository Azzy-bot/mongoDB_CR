'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './upload-container.scss';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file first');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setMessage('File uploaded and processed successfully!');
      
      // Redirect to the fixtures page after successful upload
      router.push('/search');
    } catch (error) {
      setMessage('Error uploading file: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-container__content">
        <h2 className="upload-container__title">Upload Fixtures Data</h2>
        
        <form onSubmit={handleUpload} className="upload-container__form">
          <div>
            <label className="upload-container__label">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="upload-container__file-input"
            />
          </div>

          <button
            type="submit"
            disabled={uploading || !file}
            className={`upload-container__submit-button ${uploading || !file ? 'upload-container__submit-button--disabled' : 'upload-container__submit-button--enabled'}`}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>

        {message && (
          <div className={`upload-container__message ${message.includes('Error') ? 'upload-container__message--error' : 'upload-container__message--success'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
} 