const mongoose = require("mongoose");

const chatSchema = mongoose.Schema(
  {
    isGroupChat: {
      type: Boolean,
      default: false
    },
    chatName: {
      type: String,
      trim: true
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Messages",
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    groupPic: {
      type: String,
    },
    blockedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    wallpapers: {
      type: Map,
      of: String,
      default: {}
    },
    nicknames: {
      type: Map,
      of: String,
      default: {}
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Chat", chatSchema);