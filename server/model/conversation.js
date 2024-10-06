const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const conversestionSchema = Schema(
    {
        members: {
            type: Array,
            required: true,
        },
        
      
    },
    { timestamps: true }
);
module.exports = model("conversestion", conversestionSchema);

