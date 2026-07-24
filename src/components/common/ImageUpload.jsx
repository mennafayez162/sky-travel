import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import { uploadFile, getFileUrl, deleteFile } from '../../services/supabase';
import toast from 'react-hot-toast';

const ImageUpload = ({ value, onChange, bucket = 'images', folder = 'uploads', label = 'Upload Image' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      await uploadFile(bucket, file, path);
      const url = getFileUrl(bucket, path);

      setPreview(url);
      onChange(url, path);
      toast.success('Image uploaded!');
    } catch (err) {
      toast.error('Upload failed');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setPreview('');
    onChange('', '');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div>
      <label className="block text-sm text-gray-300 mb-2">{label}</label>

      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Preview" className="w-40 h-28 object-cover rounded-xl border border-dark-border" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <FiX className="w-3 h-3 text-white" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-dark-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-primary/50 transition-colors"
        >
          {uploading ? (
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <FiImage className="w-10 h-10 text-gray-500" />
          )}
          <span className="text-sm text-gray-400">{uploading ? 'Uploading...' : 'Click to upload image'}</span>
          <span className="text-xs text-gray-600">PNG, JPG up to 5MB</span>
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;
