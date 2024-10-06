const userModel = require("../model/userModel");
const conversations = require("../model/conversation");
const Messages = require("../model/messages");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretKey = "Key";





module.exports = {
    signUp: async (req, res) => {
        try {
            const { fullName, email, password, } = req.body;
            if (!fullName || !email || !password) {
                return res.status(400).send({
                    responseCode: 400,
                    responseMessage: "Full name, email, and password are required."
                });
            }

            const existingUser = await userModel.findOne({ email });
            if (existingUser) {
                return res.status(409).send({
                    responseCode: 409,
                    responseMessage: "User with this email already exists."
                });
            }

            const hashedPassword = bcrypt.hashSync(password, 10);


            const newUser = new userModel({
                fullName,
                email,
                password: hashedPassword,

            });

            const result = await newUser.save();

            return res.status(200).send({
                responseCode: 200,
                responseMessage: "User registered successfully.",
                responseResult: result,
            });
        } catch (error) {
            console.error(error);
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
            const user = await userModel.findOne({ email });

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
                { expiresIn: '24h' } // Token expires in 24 hours
            );
            await userModel.updateOne(
                { _id: user._id },
                {
                    $set: { token: token },
                }
            );

            return res.status(200).send({
                responseCode: 200,
                responseMessage: "Login successful.",
                token: token,
                name: user.fullName,
                email: user.email

            });

        } catch (error) {
            console.error(error);
            return res.status(500).send({
                responseCode: 500,
                responseMessage: "Internal server error.",
            });
        }
    },

    conversation: async (req, res) => {
        try {

            const { senderId, receiverId } = req.body;

            const newCoversation = new conversations({ members: [senderId, receiverId] });

            await newCoversation.save();

            return res.status(200).send({
                responseCode: 200,
                responseMessage: "Conversation created successfully."
            });

        } catch (error) {
            console.error(error);
            return res.status(500).send({
                responseCode: 500,
                responseMessage: "Internal server error.",
            });
        }
    },

    getUserId: async (req, res) => {
        try {
            const userId = req.params.userId;
            const conversationss = await conversations.find({ members: { $in: [userId] } });
            const conversationUserData = Promise.all(conversationss.map(async (conversation) => {
                const receiverId = conversation.members.find((member) => member !== userId);
                const user = await userModel.findById(receiverId);
                return { user: { email: user.email, fullName: user.fullName }, conversationId: conversation._id }
            }))
            res.status(200).json(await conversationUserData);
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                responseCode: 500,
                responseMessage: "Internal server error.",
            });

        }
    },
    message: async (req, res) => {

        try {
            const { conversationId, senderId, message, receiverId = '' } = req.body;
            if (!senderId || !message) return res.status(400).send('please fill all required fileds')
            if (!conversationId && receiverId) {
                const newCoversation = new conversations({ members: [senderId, receiverId] });
                await newCoversation.save();
                const newMessage = new Messages({ conversationId: newCoversation._id, senderId, message });
                await newMessage.save()
                return res.status(200).send('message sent successfully. ')
            }else if(!conversationId && !receiverId){
                return res.status(200).send('fields required. ')

            }
            const newMessage = new Messages({ conversationId, senderId, message });

            await newMessage.save();

            res.status(200).send('Message sent successfully');

        } catch (error) {
            console.error(error);
            return res.status(500).send({
                responseCode: 500,
                responseMessage: "Internal server error.",
            });

        }

    },
    getConversationId: async (req, res) => {
        try {
            const conversationId = req.params.conversationId;
            if (!conversationId) return res.status(200).json([])
            const messages = await Messages.find({ conversationId });
            const messageUserData = Promise.all(messages.map(async (message) => {
                const user = await userModel.findById(message.senderId);
                return { user: { email: user.email, fullName: user.fullName }, message: message.message }
            }));
            res.status(200).json(await messageUserData);
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                responseCode: 500,
                responseMessage: "Internal server error.",
            });

        }
    },


}



