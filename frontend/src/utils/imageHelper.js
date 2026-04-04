import api from '../api/api';

/**
 * Returns the correct image URL whether the path is a full Cloudinary URL
 * or a legacy local path (e.g., /uploads/image-123.jpg).
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL (Cloudinary or any other), return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    // Legacy: local upload path — prepend server URL
    const serverUrl = api.defaults.baseURL.replace('/api', '');
    return `${serverUrl}${imagePath}`;
};
