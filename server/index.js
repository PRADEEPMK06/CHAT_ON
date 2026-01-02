const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const socket = require("socket.io");
const path = require("path");

require("dotenv").config();

mongoose.set("strictQuery", true);

const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messagesRoute");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

app.use(cors({
  origin: "*",
  credentials: true,
}));

app.use(express.json());
app.use("/images", express.static("images"));

app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chats", chatRoutes);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB connected successfully"))
  .catch((err) => console.log("DB connection error:", err.message));

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

const io = socket(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("contacts", (data) => {
    if (data) {
      socket.emit("contacts", data);
    }
  });

  socket.on("new message", (newMessageRecieved) => {
    socket
      .in(newMessageRecieved.chatId)
      .emit("message recieved", newMessageRecieved);
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
  });
});
