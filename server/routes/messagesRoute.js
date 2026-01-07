const { addMessage, getMessages } = require("../controller/messagesController");
const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { uploadAttachment } = require("../config/cloudinary");

router.route("/addmsg/",).put(protect, uploadAttachment.single("attachment"), addMessage);
router.route("/getmsg/:chatId",).get(protect, getMessages);
module.exports = router;