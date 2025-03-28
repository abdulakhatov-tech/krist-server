import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.config';

// Function to create folder if it doesn't exist
async function ensureFolderExists(folderName: string) {
  try {
    await cloudinary.api.create_folder(folderName);
  } catch (error) {
    if (error.http_code !== 409) {
      // Ignore error if folder already exists (409 means "already exists")
      console.error('Error creating Cloudinary folder:', error);
    }
  }
}

export const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const folderName = 'kirst'; // Change to your preferred folder name
    await ensureFolderExists(folderName); // Ensure folder exists before uploading

    const allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'pdf', 'mp4', 'mov', 'avi'];
    const fileExtension = file.mimetype.split('/')[1]?.toLowerCase();

    let resourceType: 'image' | 'video' | 'raw' = 'raw';
    if (file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    }

    return {
      folder: folderName,
      format: allowedFormats.includes(fileExtension) ? fileExtension : undefined,
      public_id: `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`,
      resource_type: resourceType,
    };
  },
});
