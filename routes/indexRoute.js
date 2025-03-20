const express = require("express");
const router = express.Router();
const IndexController = require("../controllers/indexController")
const requireAuthentication = require("../passport").authenticateUser


router.post("/sign-up", IndexController.signUp)
router.post("/log-in", IndexController.logIn)

router.post("/create-board", requireAuthentication, IndexController.createBoard)
router.get("/get-boards", requireAuthentication, IndexController.getBoards)
router.get("/display-board", requireAuthentication, IndexController.displayBoard)
router.post("/close-board", requireAuthentication, IndexController.closeBoard)

router.post("/create-dashbord-card", requireAuthentication, IndexController.createDashbordCard)
router.get("/display-dashbord-card", requireAuthentication, IndexController.displayDashbordCard)
router.post("/update-dashbord-card", requireAuthentication, IndexController.updateDashbordCard)

router.post("/create-child-card", requireAuthentication, IndexController.createChildCard)
router.get("/get-child-card", requireAuthentication, IndexController.getChildCard)

router.post("/update-child-card-title", requireAuthentication, IndexController.updateChildCardTitle)
router.post("/update-child-card-description", requireAuthentication, IndexController.updateChildCardDescription)
router.post("/update-child-card-status", requireAuthentication, IndexController.updateChildCardStatus)
router.post("/update-child-card", requireAuthentication, IndexController.updateChildCard)
router.post("/child-card-archive", requireAuthentication, IndexController.childCardArchive)

router.post("/collaborator-access", requireAuthentication, IndexController.collaboratorAccess)
router.get("/get-notification", requireAuthentication, IndexController.getNotification)

router.post("/update-time", requireAuthentication, IndexController.updateTime)

router.post("/screen-shot", requireAuthentication, IndexController.screenShot)
router.get("/get-board-users", requireAuthentication, IndexController.getBoardUsers)

// router.post("/create-new-chat", requireAuthentication, IndexController.createNewChat)
// router.post("/send-message", requireAuthentication, IndexController.sendMessage)
// router.get("/get-messages", requireAuthentication, IndexController.getMessages)

// router.get("/get-all-users", requireAuthentication, IndexController.getAllUsers)

router.post("/create-chat-room", requireAuthentication, IndexController.createChatRoom)
router.post("/send-chat-message", requireAuthentication, IndexController.sendChatMessage)
router.get("/get-chat-room-messages", requireAuthentication, IndexController.getChatRoomMessages)

// router.post("/file-upload", IndexController.fileUpload)
// router.post("/min-max", requireAuthentication, IndexController.minMaxDashbordCard)

module.exports = router