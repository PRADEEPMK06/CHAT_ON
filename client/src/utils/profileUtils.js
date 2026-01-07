// Utility function to get profile picture URL with fallback to gender-based default
export const getProfilePicUrl = (profilePic, gender = 'male', cacheBuster = null) => {
    const basePath = process.env.REACT_APP_PROFILE_PICS_PATHS;
    
    // If no profile pic or it's a default, use gender-based default
    if (!profilePic || profilePic === 'default.svg' || profilePic === '' || 
        profilePic === 'male.svg' || profilePic === 'female.svg') {
        return basePath + (gender === 'female' ? 'female.svg' : 'male.svg');
    }
    
    // If it's already a full URL (Cloudinary), return it directly
    if (profilePic.startsWith('http://') || profilePic.startsWith('https://')) {
        return cacheBuster ? `${profilePic}?v=${cacheBuster}` : profilePic;
    }
    
    // Add cache buster if provided to force browser to reload the image
    const url = basePath + profilePic;
    return cacheBuster ? `${url}?v=${cacheBuster}` : url;
};

// Get default profile pic based on gender
export const getDefaultProfilePic = (gender = 'male') => {
    return gender === 'female' ? 'female.svg' : 'male.svg';
};

// Utility function to get attachment URL
export const getAttachmentUrl = (attachment) => {
    if (!attachment || attachment === '') return '';
    // If it's already a full URL (Cloudinary), return it directly
    if (attachment.startsWith('http://') || attachment.startsWith('https://')) {
        return attachment;
    }
    return process.env.REACT_APP_ATTACHMENT_PATHS + attachment;
};

// Utility function to get group picture URL
export const getGroupPicUrl = (groupPic, cacheBuster = null) => {
    const basePath = process.env.REACT_APP_PROFILE_PICS_PATHS;
    
    // If no group pic or it's a default
    if (!groupPic || groupPic === 'default-group.svg' || groupPic === '') {
        return basePath + 'default-group.svg';
    }
    
    // If it's already a full URL (Cloudinary), return it directly
    if (groupPic.startsWith('http://') || groupPic.startsWith('https://')) {
        return cacheBuster ? `${groupPic}?v=${cacheBuster}` : groupPic;
    }
    
    const url = basePath + groupPic;
    return cacheBuster ? `${url}?v=${cacheBuster}` : url;
};

// Utility function to get banner picture URL
export const getBannerPicUrl = (bannerPic) => {
    if (!bannerPic || bannerPic === '') return '';
    
    // If it's already a full URL (Cloudinary), return it directly
    if (bannerPic.startsWith('http://') || bannerPic.startsWith('https://')) {
        return bannerPic;
    }
    
    return process.env.REACT_APP_PROFILE_PICS_PATHS + bannerPic;
};
