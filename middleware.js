// const helper = require("./config/helper");
// const db = require("./models")
// const User = db.users;
// const Board = db.boards;

// const checkPermission = async (req, res, next) => {
//     const userId = req.user.id;

//     const date = await Board.findOne({
//         where: { user_id: id }
//     })

//     if (userId != date?.user_id) {
//         return helper.permission(res, "You don't have permisson",);
//     }
//     next();

// };

// module.exports = checkPermission;