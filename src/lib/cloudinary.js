import {v2 as cloudinary} from 'cloudinary';
import "dotenv/config";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
     * Generate signed upload parameters for direct client uploads.
     * @param {string} folder - The folder path where the file should be uploaded (e.g. "books/pdfs")
     * @returns {object} An object containing signature data.
*/
export const getSignedUploadParams = (folder = '') => {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
        {
            timestamp,
            folder,
            resource_type: "auto",
            type: "upload"
        },
        process.env.CLOUDINARY_API_SECRET
    );

    return {
        timestamp,
        signature,
        folder,
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    };
};

export default cloudinary;
