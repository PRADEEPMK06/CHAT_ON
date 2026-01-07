// Utility function to get profile picture URL with fallback to gender-based default
export const getProfilePicUrl = (profilePic, gender = 'male') => {
    const basePath = process.env.REACT_APP_PROFILE_PICS_PATHS;
    
    // If no profile pic or it's a default, use gender-based default
    if (!profilePic || profilePic === 'default.svg' || profilePic === '' || 
        profilePic === 'male.svg' || profilePic === 'female.svg') {
        return basePath + (gender === 'female' ? 'female.svg' : 'male.svg');
    }
    
    return basePath + profilePic;
};

// Get default profile pic based on gender
export const getDefaultProfilePic = (gender = 'male') => {
    return gender === 'female' ? 'female.svg' : 'male.svg';
};
