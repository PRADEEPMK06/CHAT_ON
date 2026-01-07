const User = require('../model/userModel');
const Chat = require("../model/chatModel");
const Messages = require("../model/messageModel");
const bcrypt = require('bcrypt');
const config = require('config');
const { generateToken } = require('../config/generateToken');
const { generateOTP, sendOTPEmail } = require('../config/emailService');
const { cloudinary } = require('../config/cloudinary');

// Helper function to extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
    if (!url || !url.includes('cloudinary')) return null;
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    const parentFolder = parts[parts.length - 3];
    return `${parentFolder}/${folder}/${filename.split('.')[0]}`;
};

// Step 1: Initial registration - sends OTP
module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password, gender } = req.body;
        const usernameCheck = await User.findOne({ username });
        const emailCheck = await User.findOne({ email });
        
        // Set default profile pic based on gender if no custom pic uploaded
        let profilePicUrl;
        if (req.file) {
            // Cloudinary returns the full URL in req.file.path
            profilePicUrl = req.file.path;
        } else {
            // Use gender-based default profile picture
            profilePicUrl = gender === 'female' ? 'female.svg' : 'male.svg';
        }

        if (usernameCheck) {
            return res.json({ msg: "The username is already used", status: false });
        }
        if (emailCheck) {
            return res.json({ msg: "The email is already used", status: false });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            gender: gender || 'male',
            profilePic: profilePicUrl,
            isVerified: false,
            otp: otp,
            otpExpires: otpExpires,
        });

        // Check if email credentials are configured
        const isEmailConfigured = process.env.EMAIL_USER && 
                                   process.env.EMAIL_USER !== 'your-email@gmail.com' &&
                                   process.env.EMAIL_PASS && 
                                   process.env.EMAIL_PASS !== 'your-app-password';

        if (isEmailConfigured) {
            // Send OTP email
            const emailResult = await sendOTPEmail(email, otp, username);
            
            if (!emailResult.success) {
                // Delete user if email sending fails
                await User.deleteOne({ _id: user._id });
                return res.json({ 
                    msg: "Failed to send verification email. Please try again.", 
                    status: false 
                });
            }

            return res.json({
                status: true,
                requiresVerification: true,
                userId: user._id,
                email: email,
                msg: "Registration successful! Please check your email for the OTP verification code."
            });
        } else {
            // Dev mode: Auto-verify user if email is not configured
            user.isVerified = true;
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();

            console.log(`[DEV MODE] User ${username} auto-verified. OTP was: ${otp}`);
            
            return res.json({
                status: true,
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    gender: user.gender,
                    profilePic: user.profilePic,
                    bannerPic: user.bannerPic,
                    bannerColor: user.bannerColor,
                    isAdmin: user.isAdmin,
                    token: generateToken(user._id),
                }
            });
        }
    } catch (e) {
        next(e);
    };
};

// Step 2: Verify OTP and complete registration
module.exports.verifyOTP = async (req, res, next) => {
    try {
        const { userId, otp } = req.body;
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.json({ msg: "User not found", status: false });
        }

        if (user.isVerified) {
            return res.json({ msg: "Email already verified", status: false });
        }

        if (!user.otp || !user.otpExpires) {
            return res.json({ msg: "No OTP request found. Please register again.", status: false });
        }

        if (new Date() > user.otpExpires) {
            return res.json({ msg: "OTP has expired. Please request a new one.", status: false });
        }

        if (user.otp !== otp) {
            return res.json({ msg: "Invalid OTP. Please try again.", status: false });
        }

        // OTP is valid - verify user
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        return res.json({
            status: true,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                gender: user.gender,
                profilePic: user.profilePic,
                bannerPic: user.bannerPic,
                bannerColor: user.bannerColor,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            }
        });
    } catch (e) {
        next(e);
    }
};

// Resend OTP
module.exports.resendOTP = async (req, res, next) => {
    try {
        const { userId } = req.body;
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.json({ msg: "User not found", status: false });
        }

        if (user.isVerified) {
            return res.json({ msg: "Email already verified", status: false });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send OTP email
        const emailResult = await sendOTPEmail(user.email, otp, user.username);
        
        if (!emailResult.success) {
            return res.json({ 
                msg: "Failed to send verification email. Please try again.", 
                status: false 
            });
        }

        return res.json({
            status: true,
            msg: "New OTP sent to your email."
        });
    } catch (e) {
        next(e);
    }
};

module.exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.json({ msg: "Incorrect username or password", status: false });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.json({ msg: "Incorrect username or password", status: false });
        }
        
        // Check if email is verified (also handles old users without isVerified field)
        if (user.isVerified !== true) {
            // Generate new OTP and send
            const otp = generateOTP();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
            user.otp = otp;
            user.otpExpires = otpExpires;
            user.isVerified = false; // Set explicitly for old users
            await user.save();
            
            const emailResult = await sendOTPEmail(user.email, otp, user.username);
            
            if (!emailResult.success) {
                return res.json({ 
                    msg: "Failed to send verification email. Please check email configuration.",
                    status: false
                });
            }
            
            return res.json({ 
                msg: "Email not verified. A verification code has been sent to your email.",
                status: false,
                requiresVerification: true,
                userId: user._id,
                email: user.email
            });
        }
        
        if (user && isPasswordValid) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                gender: user.gender,
                profilePic: user.profilePic,
                bannerPic: user.bannerPic,
                bannerColor: user.bannerColor,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
                status: true,
            });
        } else {
            res.status(401);
        }
    } catch (e) {
        next(e);
    }
};

module.exports.getAllUsers = async (req, res, next) => {
    try {
        const keyword = req.query.search
            ? { username: { $regex: req.query.search, $options: "i" } }
            : {};
        const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
        res.send(users);
    } catch (e) {
        next(e);
    }
};

module.exports.renameUser = async (req, res) => {
    const { userId, newUsername } = req.body;
    const usernameCheck = await User.findOne({ username: newUsername });
    if (usernameCheck) {
        return res.json({ msg: "The username is already used", status: false });
    }
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            username: newUsername
        },
        { new: true, }
    );
    if (!updatedUser) {
        res.status(404);
        throw new Error("User Not Found");
    } else {
        res.json({
            status: true, updatedUser: {
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                profilePic: updatedUser.profilePic,
                bannerPic: updatedUser.bannerPic,
                bannerColor: updatedUser.bannerColor,
                isAdmin: updatedUser.isAdmin,
                token: generateToken(updatedUser._id),
            }
        });
    }
};

module.exports.emailUpdate = async (req, res) => {
    const { userId, newEmail } = req.body;
    const emailCheck = await User.findOne({ email: newEmail });
    if (emailCheck) return res.json({ msg: "The email is already used", status: false });
    const updatedUser = await User.findByIdAndUpdate(userId, { email: newEmail, }, { new: true, });
    if (!updatedUser) {
        res.status(404);
        throw new Error("User Not Found");
    } else {
        res.json({
            status: true, updatedUser: {
                _id: updatedUser._id, username: updatedUser.username,
                email: updatedUser.email, profilePic: updatedUser.profilePic,
                bannerPic: updatedUser.bannerPic, bannerColor: updatedUser.bannerColor,
                isAdmin: updatedUser.isAdmin, token: generateToken(updatedUser._id),
            }
        });
    }
};

module.exports.profilePicUpdate = async (req, res) => {
    const { userId, removeProfilePic } = req.body;
    
    // Get current user to check gender for default pic
    const currentUser = await User.findById(userId);
    if (!currentUser) {
        return res.status(404).json({ status: false, message: "User not found" });
    }
    
    let profilePicUrl;
    
    if (removeProfilePic) {
        // Set to gender-based default
        profilePicUrl = currentUser.gender === 'female' ? 'female.svg' : 'male.svg';
        
        // Delete old profile pic from Cloudinary if it's not a default
        if (currentUser.profilePic && 
            currentUser.profilePic.includes('cloudinary')) {
            try {
                const publicId = getPublicIdFromUrl(currentUser.profilePic);
                if (publicId) await cloudinary.uploader.destroy(publicId);
            } catch (e) {
                console.log('Could not delete old profile pic from Cloudinary:', e.message);
            }
        }
    } else if (req.file) {
        // Cloudinary returns full URL in req.file.path
        profilePicUrl = req.file.path;
        
        // Delete old profile pic from Cloudinary if it's not a default
        if (currentUser.profilePic && 
            currentUser.profilePic.includes('cloudinary')) {
            try {
                const publicId = getPublicIdFromUrl(currentUser.profilePic);
                if (publicId) await cloudinary.uploader.destroy(publicId);
            } catch (e) {
                console.log('Could not delete old profile pic from Cloudinary:', e.message);
            }
        }
    } else {
        // No file and not removing, keep current
        profilePicUrl = currentUser.profilePic;
    }
    
    const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: profilePicUrl }, { new: true });
    
    res.json({
        status: true, updatedUser: {
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            gender: updatedUser.gender,
            profilePic: updatedUser.profilePic,
            bannerPic: updatedUser.bannerPic,
            bannerColor: updatedUser.bannerColor,
            isAdmin: updatedUser.isAdmin,
            token: generateToken(updatedUser._id),
        }
    });
};

module.exports.bannerUpdate = async (req, res) => {
    const { userId, bannerColor } = req.body;
    // Cloudinary returns full URL in req.file.path
    const bannerPicUrl = (req.file) ? req.file.path : '';
    
    const updateData = {};
    if (req.file) {
        updateData.bannerPic = bannerPicUrl;
    }
    if (bannerColor) {
        updateData.bannerColor = bannerColor;
        updateData.bannerPic = ''; // Clear image if color is set
    }
    
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!updatedUser) {
        res.status(404);
        throw new Error("User Not Found");
    } else {
        res.json({
            status: true, updatedUser: {
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                profilePic: updatedUser.profilePic,
                bannerPic: updatedUser.bannerPic,
                bannerColor: updatedUser.bannerColor,
                isAdmin: updatedUser.isAdmin,
                token: generateToken(updatedUser._id),
            }
        });
    }
};

module.exports.passwordUpdate = async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;
    const user = await User.findOne({ _id: userId });
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
        return res.json({ msg: "Incorrect password", status: false });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            password: hashedPassword,
        },
        { new: true, }
    );

    if (!updatedUser) {
        res.status(404);
        throw new Error("User Not Found");
    } else {
        delete updatedUser.password;
        res.json({ status: true })
    }
};

module.exports.deleteProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }
        
        const allChats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } });
        const groupAdminChats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } }, groupAdmin: userId });
        const profilePicUrl = user.profilePic;

        // Delete group pics for chats where user is admin
        if (groupAdminChats.length !== 0 && groupAdminChats !== undefined) {
            let groupPicArr = [];
            groupAdminChats.map((chat) => { groupPicArr.push(chat.groupPic) });
            const filtered = groupPicArr.filter(pic => pic && pic !== 'default-group.svg');
            for (const pic of filtered) {
                try {
                    await unlinkAsync(path.join(__dirname, '../images/profile_pictures/', pic));
                } catch (e) {
                    console.log('Could not delete group pic:', pic);
                }
            }
        }

        // Delete user's profile pic if not default
        if (profilePicUrl && profilePicUrl !== 'default.svg' && profilePicUrl !== 'male.svg' && profilePicUrl !== 'female.svg') {
            try {
                await unlinkAsync(path.join(__dirname, '../images/profile_pictures/', profilePicUrl));
            } catch (e) {
                console.log('Could not delete profile pic:', profilePicUrl);
            }
        }

        const removedMessages = await Messages.deleteMany({ chat: { $in: allChats.map(c => c._id) } });
        await Chat.deleteMany({ users: { $elemMatch: { $eq: req.user._id } }, groupAdmin: userId });
        await Chat.updateMany(
            { users: { $elemMatch: { $eq: req.user._id } }, isGroupChat: true },
            { $pull: { users: userId } },
            { new: true }
        );

        const removedNotGroupChats = await Chat.deleteMany({ users: { $elemMatch: { $eq: req.user._id } }, isGroupChat: false });
        const removed = await User.deleteOne({ _id: userId });
        
        res.json({ status: true });
    } catch (error) {
        console.error('Delete profile error:', error);
        res.status(500).json({ status: false, message: "Error deleting account" });
    }
};

// Migrate existing users to have gender and default profile pics
module.exports.migrateUsersDefaults = async (req, res, next) => {
    try {
        // Find all users without gender field or with default.svg profile pic
        const usersToUpdate = await User.find({
            $or: [
                { gender: { $exists: false } },
                { gender: null },
                { profilePic: 'default.svg' },
                { profilePic: { $exists: false } },
                { profilePic: null },
                { profilePic: '' }
            ]
        });

        let updatedCount = 0;
        for (const user of usersToUpdate) {
            const updateData = {};
            
            // Set default gender if not exists
            if (!user.gender) {
                updateData.gender = 'male'; // Default to male for existing users
            }
            
            // Set default profile pic based on gender if it's missing or default.svg
            if (!user.profilePic || user.profilePic === 'default.svg' || user.profilePic === '') {
                updateData.profilePic = (user.gender === 'female' || updateData.gender === 'female') 
                    ? 'female.svg' 
                    : 'male.svg';
            }
            
            if (Object.keys(updateData).length > 0) {
                await User.findByIdAndUpdate(user._id, updateData);
                updatedCount++;
            }
        }

        res.json({ 
            status: true, 
            message: `Successfully updated ${updatedCount} users with default values.`,
            updatedCount 
        });
    } catch (e) {
        next(e);
    }
};