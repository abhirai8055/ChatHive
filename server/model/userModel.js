const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const users = Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
       
        email: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        token: {
            type:String,
        }
        
      
    },
    { timestamps: true }
);
module.exports = model("user", users);

