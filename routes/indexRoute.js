const express = require("express");
const router = express.Router();

// const { signUp, logIn, createBoard, getBoards, createDashbordCard,
//      displayDashbordCard, createChildCard, displayChildCards,
//       updateChildCardStatus, updateChildCard, collaboratorAccess,
//        minMaxDashbordCard } = require("../controllers/indexController")

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

router.post("/update-child-card-status", requireAuthentication, IndexController.updateChildCardStatus)
router.post("/update-child-card", requireAuthentication, IndexController.updateChildCard)
router.post("/child-card-archive", requireAuthentication, IndexController.childCardArchive)

router.post("/collaborator-access", requireAuthentication, IndexController.collaboratorAccess)

router.post("/min-max", requireAuthentication, IndexController.minMaxDashbordCard)

module.exports = router 