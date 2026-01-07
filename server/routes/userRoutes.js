const { login, 
    register,
    verifyOTP,
    resendOTP,
    getAllUsers, 
    renameUser, 
    emailUpdate, 
    profilePicUpdate,
    bannerUpdate,
    passwordUpdate,
    deleteProfile,
    migrateUsersDefaults,
 } = require("../controller/userController");
const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { uploadProfilePic, uploadBanner } = require("../config/cloudinary");

router.post("/register", uploadProfilePic.single("profilePic"), register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

router.route("/allUsers").get(protect, getAllUsers);
router.route("/deleteUser").put(protect, deleteProfile);
router.route("/renameUser").put(protect, renameUser);
router.route("/emailUpdate").put(protect, emailUpdate);
router.route("/profilePicUpdate").put(protect, uploadProfilePic.single("profilePic"), profilePicUpdate);
router.route("/bannerUpdate").put(protect, uploadBanner.single("bannerPic"), bannerUpdate);
router.route("/passwordUpdate").put(protect, passwordUpdate);
router.route("/migrateDefaults").post(protect, migrateUsersDefaults);

module.exports = router;