const helper = require("./config/helper");
const db = require("./models")
const User = db.users;
const Board = db.boards;

const checkPermission = async (req, res, next) => {
    const userId = req.user.id;
    const { board_id } = req.query;

    let board = await Board.findOne({
        attributes: ["id", "title", "user_id"],
        where: {
            id: board_id,
        }
    })

    if (!board) {
        return helper.error(res, "Board not found")
    }

    if (userId != board.user_id) {
        return helper.permission(res, "You do not have permisson",);
    }

    next();

};

module.exports = checkPermission;
