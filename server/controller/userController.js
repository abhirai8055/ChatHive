// controller/userController.js

const Users = require("../model/userModel");
const Conversation = require("../model/conversation"); // Corrected to singular
const Messages = require("../model/messages");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretKey = "Key"; // Consider moving this to environment variables

module.exports = {
  signUp: async (req, res, next) => {
    try {
      const { fullName, email, password } = req.body;
      if (!fullName || !email || !password) {
        return res.status(400).send({
          responseCode: 400,
          responseMessage: "Full name, email, and password are required.",
        });
      }

      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        return res.status(409).send({
          responseCode: 409, // Corrected response code
          responseMessage: "User with this email already exists.",
        });
      }

      // Hash the password before creating the user
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new Users({
        fullName, // Ensure fullName is saved
        email,
        password: hashedPassword, // Set hashed password
      });

      await newUser.save();

      return res.status(201).send({
        responseCode: 201,
        responseMessage: "User registered successfully.",
        // Optionally, include user details without password
        responseResult: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
        },
      });
    } catch (error) {
      console.error("SignUp Error:", error);
      return res.status(500).send({
        responseCode: 500,
        responseMessage: "Internal server error.",
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if email and password are provided
      if (!email || !password) {
        if (!email) {
          return res.status(400).send({
            responseCode: 400,
            responseMessage: "Email is required.",
          });
        } else if (!password) {
          return res.status(400).send({
            responseCode: 400,
            responseMessage: "Password is required.",
          });
        }
      }

      // Find the user by email
      const user = await Users.findOne({ email });

      if (!user) {
        return res.status(404).send({
          responseCode: 404,
          responseMessage: "Email not found.",
        });
      }

      // Compare the provided password with the stored hashed password
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        return res.status(401).send({
          responseCode: 401,
          responseMessage: "Incorrect password.",
        });
      }

      // Generate a token for the user
      const token = jwt.sign(
        { _id: user._id },
        secretKey,
        { expiresIn: "24h" } // Token expires in 24 hours
      );
      await Users.updateOne(
        { _id: user._id },
        {
          $set: { token: token },
        }
      );

      return res.status(200).send({
        responseCode: 200,
        responseMessage: "Login successful.",
        id: user._id,
        token: token,
        name: user.fullName,
        email: user.email,
      });
    } catch (error) {
      console.error("Login Error:", error);
      return res.status(500).send({
        responseCode: 500,
        responseMessage: "Internal server error.",
      });
    }
  },

  conversation: async (req, res) => {
    try {
      const { senderId, receiverId } = req.body;

      if (!senderId || !receiverId) {
        return res.status(400).send({
          responseCode: 400,
          responseMessage: "senderId and receiverId are required.",
        });
      }

      // Check if a conversation already exists between the two users
      const existingConversation = await Conversation.findOne({
        members: { $all: [senderId, receiverId] },
      });

      if (existingConversation) {
        return res.status(200).send({
          responseCode: 200,
          responseMessage: "Conversation already exists.",
          conversationId: existingConversation._id,
        });
      }

      // Create a new conversation
      const newConversation = new Conversation({
        members: [senderId, receiverId],
      });

      await newConversation.save();

      return res.status(201).send({
        responseCode: 201,
        responseMessage: "Conversation created successfully.",
        conversationId: newConversation._id,
      });
    } catch (error) {
      console.error("Conversation Error:", error);
      return res.status(500).send({
        responseCode: 500,
        responseMessage: "Internal server error.",
      });
    }
  },

  getUserId: async (req, res) => {
    try {
      const userId = req.params.userId;
      const conversationsList = await Conversation.find({
        members: { $in: [userId] },
      });

      const conversationUserData = await Promise.all(
        conversationsList.map(async (conversation) => {
          const receiverId = conversation.members.find(
            (member) => member !== userId
          );
          const user = await Users.findById(receiverId);
          return {
            user: {
              receiverId: user._id,
              email: user.email,
              fullName: user.fullName,
            },
            conversationId: conversation._id,
          };
        })
      );

      res.status(200).json(conversationUserData);
    } catch (error) {
      console.error("GetUserId Error:", error);
      return res.status(500).send({
        responseCode: 500,
        responseMessage: "Internal server error.",
      });
    }
  },

  message: async (req, res) => {
    try {
      const { conversationId, senderId, message, receiverId = "" } = req.body;
      if (!senderId || !message)
        return res.status(400).send("Please fill all required fields.");

      if (conversationId === "new" && receiverId) {
        const newConversation = new Conversation({
          members: [senderId, receiverId],
        });
        await newConversation.save();
        const newMessage = new Messages({
          conversationId: newConversation._id,
          senderId,
          message,
        });
        await newMessage.save();
        return res.status(200).send("Message sent successfully.");
      } else if (!conversationId && !receiverId) {
        return res.status(400).send("Fields required.");
      }

      const newMessage = new Messages({ conversationId, senderId, message });

      await newMessage.save();

      res.status(200).send("Message sent successfully.");
    } catch (error) {
      console.error("Message Error:", error);
      return res.status(500).send({
        responseCode: 500,
        responseMessage: "Internal server error.",
      });
    }
  },

  getConversationId: async (req, res) => {
    try {
      const conversationId = req.params.conversationId;

      // If conversationId is 'new', check if a conversation exists
      if (conversationId === "new") {
        const checkConversation = await Conversation.find({
          members: { $all: [req.query.senderId, req.query.receiverId] },
        });

        if (checkConversation.length > 0) {
          return res.status(200).json([]); // Return empty array if conversation exists
        }
      } else {
        // Function to fetch messages for the given conversationId
        const checkMessages = async (conversationId) => {
          const messagesList = await Messages.find({ conversationId });

          // Map through the messages and find user details for each message
          const messageUserData = await Promise.all(
            messagesList.map(async (messageItem) => {
              const user = await Users.findById(messageItem.senderId);
              return {
                user: {
                  id: user._id,
                  email: user.email,
                  fullName: user.fullName,
                },
                message: messageItem.message,
              };
            })
          );

          // Send the response with messages and user data
          res.status(200).json(messageUserData);
        };

        // Check messages for the given conversationId
        await checkMessages(conversationId);
      }
    } catch (error) {
      console.error("GetConversationId Error:", error);
      return res.status(500).send({
        responseCode: 500,
        responseMessage: "Internal server error.",
      });
    }
  },

  getAllUser: async (req, res) => {
    try {
      const userId = req.params.userId; // Corrected to match route parameter
      if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
      }

      const allUsers = await Users.find(
        { _id: { $ne: userId } },
        "email fullName"
      ); // Select only necessary fields

      if (!allUsers || allUsers.length === 0) {
        return res.status(404).json({
          message: "No users found.",
          data: [],
        });
      }

      res.status(200).json(allUsers);
    } catch (error) {
      console.error("GetAllUser Error:", error);
      return res.status(500).json({
        responseCode: 500,
        responseMessage: "Internal server error.",
        error: error.message,
      });
    }
  },

  // Implement findById method for Socket.io
  findById: async (userId) => {
    try {
      const user = await Users.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      console.error("FindById Error:", error);
      throw error;
    }
  },
};
