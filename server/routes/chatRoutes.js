const express = require("express");
const {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    removeFromGroup,
    addToGroup,
    groupPicUpdate,
    deleteChat,
    blockChat,
    updateWallpaper,
    updateNickname,
    getUsersNotInGroup,
} = require("../controller/chatController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();
const { uploadGroupPic } = require("../config/cloudinary");

router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);
router.route("/groupremove").put(protect, removeFromGroup);
router.route("/groupadd").put(protect, addToGroup);
router.route("/grouppic").put(protect, uploadGroupPic.single("groupPic"), groupPicUpdate);
router.route("/accessChat").post(protect, accessChat);
router.route("/fetchChats").get(protect, fetchChats);
router.route("/deleteChat").put(protect, deleteChat);
router.route("/blockChat").put(protect, blockChat);
router.route("/updateWallpaper").put(protect, updateWallpaper);
router.route("/updateNickname").put(protect, updateNickname);
router.route("/usersNotInGroup/:chatId").get(protect, getUsersNotInGroup);
module.exports = router;