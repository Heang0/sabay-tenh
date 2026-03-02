import { useState } from 'react';
import { Upload, X, Plus } from 'lucide-react';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = 'ecommerce_preset';

const MultiImageUpload = ({ images = [], onUpload, onRemove }) => {
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
                    }, 'image/jpeg', 0.85); // 0.85 quality
                };
            };
        });
    };

    const handleUpload = async (e) => {
        const originalFile = e.target.files[0];
        if (!originalFile) return;

        if (images.length >= 4) {
            setError('Maximum 4 gallery images allowed');
            return;
        }

        if (!originalFile.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        setUploading(true);
        setError('');

        try {
            // Step 1: Resize BEFORE upload to save storage space
            const file = await resizeImage(originalFile);
            console.log(`Gallery: Original ${Math.round(originalFile.size / 1024)}KB -> Resized ${Math.round(file.size / 1024)}KB`);

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
                // Return optimized URL for display
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
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
                {images.map((url, index) => (
                    <div key={index} className="relative group">
                        <img
                            src={getOptimizedUrl(url)}
                            alt={`Gallery ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                        />
                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}

                {images.length < 4 && (
                    <label className={`
                        w-24 h-24 border-2 border-dashed rounded-xl 
                        flex flex-col items-center justify-center gap-1
                        cursor-pointer transition-all
                        ${uploading
                            ? 'border-gray-200 bg-gray-50'
                            : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                        }
                    `}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={uploading}
                            className="hidden"
                        />
                        {uploading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        ) : (
                            <>
                                <Plus size={20} className="text-blue-500" />
                                <span className="text-[10px] font-medium text-gray-500">Add Item</span>
                            </>
                        )}
                    </label>
                )}
            </div>

            {error && (
                <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">
                    ⚠️ {error}
                </p>
            )}

            <p className="text-[11px] text-gray-400 italic">
                {images.length}/4 gallery images. Max 600px width saved to storage.
            </p>
        </div>
    );
};

export default MultiImageUpload;
