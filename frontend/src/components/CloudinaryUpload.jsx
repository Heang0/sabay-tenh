import { useState } from 'react';
import { Upload, X } from 'lucide-react';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = 'ecommerce_preset';

const CloudinaryUpload = ({ onUpload, value, onRemove }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('Image size should be less than 10MB');
            return;
        }

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            console.log('Uploading to Cloudinary...');

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            const data = await response.json();
            console.log('Cloudinary response:', data);

            if (data.secure_url) {
                // Return optimized URL with transformations
                // f_auto: best format, q_auto: smart quality, w_600: width 600px
                const optimizedUrl = data.secure_url.replace(
                    '/upload/',
                    '/upload/f_auto,q_auto,w_600/'
                );
                onUpload(optimizedUrl);
            } else {
                setError(data.error?.message || 'Upload failed. Check your Cloudinary settings.');
                console.error('Upload error:', data);
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    // Helper to get optimized image URL for display
    const getOptimizedUrl = (url) => {
        if (!url) return '';
        // Add transformations: auto format, auto quality, width 200 for thumbnail
        return url.replace('/upload/', '/upload/f_auto,q_auto,w_200/');
    };

    return (
        <div className="space-y-2">
            {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    ❌ {error}
                </div>
            )}

            {value ? (
                <div className="relative inline-block">
                    <img
                        src={getOptimizedUrl(value)}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                        loading="lazy"
                    />
                    <button
                        type="button"
                        onClick={onRemove}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                        <X size={16} />
                    </button>
                    <p className="text-xs text-green-600 mt-1">
                        ✓ Auto-optimized (WebP, 600px width)
                    </p>
                </div>
            ) : (
                <label className="relative block w-32 h-32 cursor-pointer">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className={`
            w-full h-full border-2 border-dashed rounded-lg 
            flex flex-col items-center justify-center gap-2
            transition-colors
            ${uploading
                            ? 'border-gray-300 bg-gray-50'
                            : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
                        }
          `}>
                        {uploading ? (
                            <>
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="text-xs text-gray-600">Uploading...</span>
                            </>
                        ) : (
                            <>
                                <Upload size={24} className="text-blue-500" />
                                <span className="text-xs text-center text-gray-600">
                                    Click to upload
                                </span>
                            </>
                        )}
                    </div>
                </label>
            )}
        </div>
    );
};

export default CloudinaryUpload;