const express = require("express");
const router = express.Router();
const IndexController = require("../controllers/indexController")
const requireAuthentication = require("../passport").authenticateUser
const checkPermission = require("../middleware")


router.post("/sign-up", IndexController.signUp)
router.post("/log-in", IndexController.logIn)
router.post("/log-out", requireAuthentication, IndexController.logOut)
router.get("/get-user-login-details", requireAuthentication, IndexController.getUserLoginDetails)

router.post("/create-board", requireAuthentication, IndexController.createBoard)
router.get("/get-boards", requireAuthentication, IndexController.getBoards)
router.get("/display-board", requireAuthentication, IndexController.displayBoard)
router.post("/close-board", requireAuthentication, checkPermission, IndexController.closeBoard)

router.post("/create-dashbord-card", requireAuthentication, IndexController.createDashbordCard) // checkPermission
router.get("/display-dashbord-card", requireAuthentication, IndexController.displayDashbordCard)
router.post("/update-dashbord-card", requireAuthentication, IndexController.updateDashbordCard) // checkPermission

router.post("/create-child-card", requireAuthentication, IndexController.createChildCard)
router.get("/get-child-card", requireAuthentication, IndexController.getChildCard)

router.post("/update-child-card-title", requireAuthentication, IndexController.updateChildCardTitle)
router.post("/update-child-card-description", requireAuthentication, IndexController.updateChildCardDescription)
router.post("/update-child-card-status", requireAuthentication, IndexController.updateChildCardStatus)
router.post("/update-child-card", requireAuthentication, IndexController.updateChildCard)
router.post("/child-card-archive", requireAuthentication, IndexController.childCardArchive)

router.post("/invite-collaborator", requireAuthentication, checkPermission, IndexController.inviteCollaborator)
router.post("/accept-invite", requireAuthentication, IndexController.acceptInvite)
router.post("/reject-invite", requireAuthentication, IndexController.rejectInvite)
router.get("/get-notification", requireAuthentication, IndexController.getNotification)
router.post("/update-notofication-status", requireAuthentication, IndexController.updateNotoficationStatus)

router.post("/update-time", requireAuthentication, IndexController.updateTime)

router.post("/screen-shot", requireAuthentication, IndexController.screenShot)
router.get("/get-board-users", requireAuthentication, IndexController.getBoardUsers)

router.post("/create-chat-room", requireAuthentication, IndexController.createChatRoom)
router.post("/send-chat-message", requireAuthentication, IndexController.sendChatMessage)
router.get("/get-chat-room-messages", requireAuthentication, IndexController.getChatRoomMessages)

router.post("/user-join-card", requireAuthentication, IndexController.userJoinCard)
router.get("/get-card-joined-user", requireAuthentication, IndexController.getCardJoinedUser)

router.post("/add-remove-user", requireAuthentication, checkPermission, IndexController.handleAddRemoveUserOnCard)
router.get("/get-all-users-joined-card", requireAuthentication, IndexController.getAllUsersJoinedCard)

// router.get("/get-all-users", requireAuthentication, IndexController.getAllUsers)
// router.post("/file-upload", IndexController.fileUpload)
// router.post("/min-max", requireAuthentication, IndexController.minMaxDashbordCard)
// router.post("/collaborator-access", requireAuthentication, IndexController.collaboratorAccess)

module.exports = router