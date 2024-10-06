const mongoose =  require("mongoose");
mongoose.connect("mongodb://localhost:27017/chatApp").then(()=>{
    console.log("db is connected successfully...");
})