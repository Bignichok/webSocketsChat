const path = require("path");
const express = require("express");
const app = express();
const http = require("http").Server(app);

// put socket on http-сервер
const io = require("socket.io")(http);

// distribute static
app.use(express.static(path.resolve(__dirname, "public")));

// keep user history
const chatHistory = [];
const users = {};
let onlineUser = 0;

// watch/listen connection
io.on("connection", (socket) => {
  onlineUser += 1;
  console.log("New user connected with server");

  //user join chat
  socket.on("user/joinChat", (userName) => {
    console.log(`User ${userName} join chat`);
    users[socket.id] = userName;

    socket.emit(
      "user/joinChatSuccess",
      `${userName} - you join chat
        Online: ${onlineUser}`
    );

    socket.emit("user/connected", chatHistory);

    socket.broadcast.emit(
      "chat/userJoined",

      `${userName} connected chat;
  Online: ${onlineUser}`
    );
  });

  //chat system message
  socket.on("chat/newMessage", (message) => {
    console.log(`Received messege: ${message}`);

    const entry = {
      author: users[socket.id],
      message,
      timestamp: Date.now(),
    };

    chatHistory.push(entry);
    io.emit("chat/newMessage", entry);
  });

  //user disconnect
  socket.on("disconnect", () => {
    onlineUser -= 1;
    console.log(`disconnect user
    Online:${onlineUser}`);
  });
});

http.listen(4040, () => console.log("Server works on port 4040"));
