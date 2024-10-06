const express = require("express");
const router = express.Router();
router.use(express.json())
const controller = require("../controller/userController");

router.post("/signUp", controller.signUp);
router.post("/login", controller.login);
router.post("/conversation", controller.conversation);
router.get("/:userId", controller.getUserId);
router.post("/message", controller.message);
router.get("/coversation/:conversationId", controller.getConversationId)





module.exports = router;