const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const messageSchema = Schema(
    {
        conversationId: {
            type: String,
        },
        senderId: {
            type: String,
        },
        message: {
            type: String,
        },
    },
    { timestamps: true }
);
module.exports = model("message", messageSchema);

