const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage for profile pictures
const profilePicStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'chat-app/profile_pictures',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
        public_id: (req, file) => `profile_${Date.now()}_${file.originalname.split('.')[0]}`
    }
});

// Storage for attachments
const attachmentStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'chat-app/attachments',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
        public_id: (req, file) => `attachment_${Date.now()}_${file.originalname.split('.')[0]}`
    }
});

// Storage for banner pictures
const bannerStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'chat-app/banners',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1200, height: 400, crop: 'limit' }],
        public_id: (req, file) => `banner_${Date.now()}_${file.originalname.split('.')[0]}`
    }
});

// Storage for group pictures
const groupPicStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'chat-app/group_pictures',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
        public_id: (req, file) => `group_${Date.now()}_${file.originalname.split('.')[0]}`
    }
});

const uploadProfilePic = multer({ storage: profilePicStorage });
const uploadAttachment = multer({ storage: attachmentStorage });
const uploadBanner = multer({ storage: bannerStorage });
const uploadGroupPic = multer({ storage: groupPicStorage });

module.exports = {
    cloudinary,
    uploadProfilePic,
    uploadAttachment,
    uploadBanner,
    uploadGroupPic
};
