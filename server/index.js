const express = require("express");
const app = express();
require("./dbconnection/dbconfig");
const port =9000;

const userRouter = require("./routing/userRouter");

const io = require('socket.io')(8585,{
    cors:{
        origin:'http://localhost:3002'
    }
})
 

app.use('/user', userRouter);








app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});








