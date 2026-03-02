import { useState } from 'react';
import { Upload, X } from 'lucide-react';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = 'ecommerce_preset';

const CloudinaryUpload = ({ onUpload, value, onRemove }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    // Helper to resize image client-side before upload to save storage
    const resizeImage = (file, maxWidth = 600) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = (maxWidth / width) * height;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                    }, 'image/jpeg', 0.85); // 0.85 quality for perfect balance
                };
            };
        });
    };

    const handleUpload = async (e) => {
        const originalFile = e.target.files[0];
        if (!originalFile) return;

        if (!originalFile.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        setUploading(true);
        setError('');

        try {
            // Step 1: Resize BEFORE upload to save storage space
            const file = await resizeImage(originalFile);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', UPLOAD_PRESET);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            const data = await response.json();

            if (data.secure_url) {
                // Return optimized URL with transformations for display
                const optimizedUrl = data.secure_url.replace(
                    '/upload/',
                    '/upload/f_auto,q_auto,w_600,dpr_auto/'
                );
                onUpload(optimizedUrl);
            } else {
                setError(data.error?.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const getOptimizedUrl = (url) => {
        if (!url) return '';
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
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm"
                    >
                        <X size={16} />
                    </button>
                    <p className="text-[10px] text-green-600 mt-1 font-medium">
                        ✓ Max 600px saved to storage
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
                                <span className="text-xs text-gray-600">Optimizing...</span>
                            </>
                        ) : (
                            <>
                                <Upload size={24} className="text-blue-500" />
                                <span className="text-xs text-center text-gray-600 px-2 leading-tight">
                                    Upload & Optimize
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