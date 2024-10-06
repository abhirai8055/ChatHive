const express = require("express");
const app = express();
require("./dbconnection/dbconfig");
const port =9000;


const userRouter = require("./routing/userRouter");




app.use('/user', userRouter);








app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});








