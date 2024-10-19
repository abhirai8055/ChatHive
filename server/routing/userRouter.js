const express = require("express");
const router = express.Router();
router.use(express.json())
const controller = require("../controller/userController");
router.post("/guest", controller.createGuestUser);
router.post("/signUp", controller.signUp);
router.post("/login", controller.login);
router.post("/conversation", controller.conversation);
router.get("/:userId", controller.getUserId);
router.post("/message", controller.message);
router.get("/conversation/:conversationId", controller.getConversationId)
router.get("/data/:userId", controller.getAllUser)


 


module.exports = router;