// server.js

const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http"); // Import HTTP module
const server = http.createServer(app); // Create HTTP server
const { Server } = require("socket.io"); // Use destructuring to import Server
const io = new Server(server, { // Attach Socket.io to the HTTP server
  cors: {
    origin: "http://localhost:3000", // Adjust to your frontend's actual origin
    methods: ["GET", "POST"],
  },
});

const port = 9000;

const userRouter = require("./routing/userRouter");
const userController = require("./controller/userController");
require("./dbconnection/dbconfig");

app.use(
  cors({
    origin: "http://localhost:3000", // Allow your frontend to access this server
    methods: ["GET", "POST"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);
app.use("/user", userRouter);
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

let users = [];

// Socket.io Connection Handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("addUser", (userId) => {
    console.log(`Adding user with ID: ${userId} to Socket.io`);
    const isUserExist = users.find((user) => user.userId === userId);
    if (!isUserExist) {
      const user = {
        userId,
        socketId: socket.id,
      };
      users.push(user);
      console.log("Current Users List:", users);
      io.emit("getUsers", users);
    }
  });

  socket.on(
    "sendMessage",
    async ({ senderId, receiverId, message, conversationId }) => {
      console.log(
        `Received 'sendMessage' from Sender ID: ${senderId}, Receiver ID: ${receiverId}, Conversation ID: ${conversationId}, Message: "${message}"`
      );

      try {
        const receiver = users.find((user) => user.userId === receiverId);
        const sender = users.find((user) => user.userId === senderId);
        const user = await userController.findById(senderId);

        if (receiver) {
          console.log(
            `Emitting 'getMessage' to Receiver Socket ID: ${receiver.socketId} and Sender Socket ID: ${sender.socketId}`
          );
          io.to(receiver.socketId)
            .to(sender.socketId)
            .emit("getMessage", {
              senderId,
              message,
              conversationId,
              receiverId,
              user: { id: user._id, fullName: user.fullName, email: user.email },
            });
        } else {
          console.log(`Receiver not connected. Emitting 'getMessage' to Sender.`);
          io.to(sender.socketId).emit("getMessage", {
            senderId,
            message,
            conversationId,
            receiverId,
            user: { id: user._id, fullName: user.fullName, email: user.email },
          });
        }
      } catch (error) {
        console.error("Error handling 'sendMessage':", error);
      }
    }
  );

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    users = users.filter((user) => user.socketId !== socket.id);
    console.log("Updated Users List after disconnect:", users);
    io.emit("getUsers", users);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
