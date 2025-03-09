const helper = require("../config/helper")
const db = require("../models")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { Op } = require("sequelize")

const User = db.users;
const Board = db.boards;
const DashbordCard = db.dashbord_cards;
const ChildCard = db.child_card;
const Collaborator = db.collaborators_access;

Board.hasMany(DashbordCard, { foreignKey: "board_id" })
DashbordCard.hasMany(ChildCard, { foreignKey: "dashbord_c_id" })

User.hasMany(Board, { foreignKey: "user_id" })

// Board.hasMany(Collaborator, { foreignKey: "user_id" })

Board.belongsToMany(User, { through: Collaborator, foreignKey: "task_id", otherKey: "collaborators_id" });
// User.belongsToMany(Board, { through: Collaborator, foreignKey: "collaborators_id", otherKey: "task_id" });

module.exports = {
    signUp: async (req, res) => {
        try {
            const { name, email, password } = req.body

            const existingUser = await User.findOne({ where: { email } });
            if (!!existingUser) {
                return helper.error(res, "Email Already Exist");
            }

            // Hashing Password
            const salt = 10;
            const hashPassword = await bcrypt.hash(password, salt);

            const user = await User.create({
                name,
                email,
                password: hashPassword,
            });

            // Creating JWT Token
            const credentials = { id: user.id, email: user.email }
            const token = jwt.sign({ data: credentials }, process.env.JWT_SECRET);

            const body = {
                user: user,
                token: token
            }

            return helper.success(res, 'SignUp Successfully', body)
        } catch (error) {
            return helper.error(res, error);
        }
    },

    logIn: async (req, res) => {
        try {
            const { email, password } = req.body

            const user = await User.findOne({ where: { email } });
            if (!user) {
                return helper.error(res, 'Invalid Email');
            }

            const compPassword = await bcrypt.compare(password, user.password);
            if (!compPassword) {
                return helper.error(res, 'Incorrect Password');
            }

            const payload = { id: user.id, email: user.email }
            const token = jwt.sign({ data: payload }, process.env.JWT_SECRET);

            const body = {
                token: token,
                user: user,
            }
            return helper.success(res, 'LogIn Successfully ', body);
        } catch (error) {
            return helper.error(res, error);
        }
    },

    createBoard: async (req, res) => {
        try {
            const { id } = req.user
            const { bg_color, title, visibility } = req.body;

            if (!bg_color || !title || !visibility) {
                return helper.error(res, "Required field missing")
            }

            const data = await Board.create({
                bg_color,
                title,
                visibility,
                user_id: id
            })

            return helper.success(res, "Board created successfully", data)
        } catch (err) {
            return helper.error(res, err)
        }
    },

    getBoards: async (req, res) => {
        try {
            const { id } = req.user;

            // USER OWN BOARDS
            const data_1 = await Board.findAll({
                where: {
                    user_id: id,
                    is_bord_close: false
                }
            })
            if (!data_1) {
                return helper.error(res, "Boards not found")
            }

            const collaboratedBoards = await Board.findAll({
                include: [
                    {
                        attributes: [],
                        model: User,
                        through: { model: Collaborator, attributes: [] },
                        where: { id: id }
                    }
                ]
            });

            const data = [...data_1, ...collaboratedBoards]

            return helper.success(res, "Boards getting successfully", data)
        } catch (err) {
            return helper.error(res, err)
        }
    },

    displayBoard: async (req, res) => {
        try {
            const { id } = req.user;

            const { b_id } = req.query;
            if (!b_id) {
                return helper.error(res, "Required field missing")
            }

            const collaboratorBoards = await Collaborator.findAll({
                where: { collaborators_id: id },
                attributes: ['task_id']
            });
            const boardIds = collaboratorBoards.map(collab => collab.task_id);

            const data = await Board.findOne({
                where: {
                    id: b_id,
                    is_bord_close: false,
                    // user_id: id
                    [Op.or]: [
                        { user_id: id },
                        { id: boardIds }
                    ]
                },
                include: [
                    {
                        model: DashbordCard,
                        separate: true,
                        order: [['id', 'ASC']],
                        include: [
                            {
                                model: ChildCard,
                                where: { is_archive: false },
                                required: false,
                                separate: true,
                                order: [['id', 'ASC']],
                            }
                        ]
                    }
                ]
            })
            // data.dashbord_cards = data.dashbord_cards.sort((a, b) => a.id - b.id);
            if (!data) {
                return helper.error(res, "Board not found")
            }
            return helper.success(res, "Board displayed successfully", data)
        } catch (err) {
            return helper.error(res, err)
        }
    },

    closeBoard: async (req, res) => {
        try {
            const { board_id } = req.query;
            if (!board_id) {
                return helper.error(res, "Required field missing")
            }
            const data = await Board.findOne({ where: { id: board_id } })
            if (!data) {
                return helper.error(res, "Board not found")
            }
            data.is_bord_close = true
            data.save();

            return helper.success(res, "Board closed successfully", data)
        } catch (err) {
            return helper.error(res, err)
        }
    },


    createDashbordCard: async (req, res) => {
        try {
            const { title, board_id } = req.body;
            if (!title || !board_id) {
                return helper.error(res, "Required field missing")
            }

            const data = await DashbordCard.create({
                title,
                board_id
            })
            return helper.success(res, "Dashbord card creating successfully", data)
        } catch (err) {
            return helper.error(res, err)
        }
    },

    displayDashbordCard: async (req, res) => {
        try {
            const { id } = req.query;
            if (!id) {
                return helper.error(res, "Required field missing")
            }
            const data = await DashbordCard.findOne({
                where: { id },
                include: [
                    {
                        model: ChildCard,
                        where: { is_archive: false }
                    }
                ]
            })
            if (!data) {
                return helper.error(res, "Dashbord card not found")
            }
            return helper.success(res, "Dashbord card displayed successfully with Child Cards", data)
        } catch (err) {
            return helper.error(res, err)
        }
    },

    updateDashbordCard: async (req, res) => {
        try {
            const { d_c_id, newListTitle } = req.body;
            if (!d_c_id || !newListTitle) {
                return helper.error(res, "Required field missing")
            }

            const data = await DashbordCard.findOne({ where: { id: d_c_id } })
            if (!data) {
                return helper.error(res, "Dashbord card not found")
            }
            data.title = newListTitle
            data.save();

            return helper.success(res, "Dashbord card updated successfully", data)
        } catch (err) {
            return helper.error(res, err)
        }
    },


    createChildCard: async (req, res) => {
        try {
            const { title, description, is_checked, dashbord_c_id } = req.body;
            if (!title || !typeof is_checked == "boolean" || !dashbord_c_id) {
                return helper.error(res, "Required field missing")
            }

            const data = await ChildCard.create({
                title,
                description,
                is_checked,
                dashbord_c_id
            })
            return helper.success(res, "Child card creating successfully", data)
        } catch (err) {
            return helper.error(res, err)
        }
    },

    getChildCard: async (req, res) => {
        try {
            const { c_id } = req.query;
            if (!c_id) {
                return helper.error(res, "Required field missing")
            }
            let data = await ChildCard.findOne({ where: { id: c_id } })
            if (!data) {
                return helper.error(res, "Child card not found")
            }
            return helper.success(res, "Getting card successfully", data)
        } catch (err) {
            return helper.error(res, err)
        }
    },


    updateChildCardTitle: async (req, res) => {
        try {
            const { c_id, title } = req.body;

            if (!c_id || !title) {
                return helper.error(res, "Required field missing")
            }
            const data = await ChildCard.findOne({
                where: { id: c_id },
            })
            data.title = title
            data.save();
            return helper.success(res, "Child cards title updated successfully", data)
        } catch (err) {
            return helper.error(res, err)
        }
    },

    updateChildCardDescription: async (req, res) => {
        try {
            const { c_id, description } = req.body;

            if (!c_id || !description) {
                return helper.error(res, "Required field missing")
            }
            const data = await ChildCard.findOne({
                where: { id: c_id },
            })
            data.description = description
            data.save();
            return helper.success(res, "Child cards description updated successfully", data)
        } catch (err) {
            return helper.error(res, err)
        }
    },

    updateChildCardStatus: async (req, res) => {
        try {
            const { id, is_checked } = req.body;
            if (!id) {
                return helper.error(res, "Required field missing")
            }
            const data = await ChildCard.findOne({
                where: { id },
            })
            data.is_checked = is_checked
            data.save();
            return helper.success(res, "Child cards status updated successfully", data)
        } catch (err) {
            return helper.error(res, err)
        }
    },

    updateChildCard: async (req, res) => {
        try {
            const { id, dashbord_c_id } = req.body;
            if (!id) {
                return helper.error(res, "Required field missing")
            }
            const data = await ChildCard.findOne({
                where: { id },
            })
            data.dashbord_c_id = dashbord_c_id
            data.save();
            return helper.success(res, "Child card parent updated successfully", data)
        } catch (err) {
            return helper.error(res, err)
        }
    },

    childCardArchive: async (req, res) => {
        try {
            const { id, newStatus } = req.body;
            if (!typeof newStatus == "boolean") {
                return helper.error(res, "Required field missing")
            }

            let data = await ChildCard.findOne({ where: { id: id } })
            data.is_archive = newStatus
            data.save();

            return helper.success(res, "Child card archived successfully", data)
        } catch (err) {
            return helper.error(res, err)
        }
    },


    collaboratorAccess: async (req, res) => {
        try {
            const { task_id, collaborator_email } = req.body;
            if (!task_id || !collaborator_email) {
                return helper.error(res, "Required field missing")
            }

            let existingUser = await User.findOne({ where: { email: collaborator_email } })
            if (!existingUser) {
                return helper.error(res, "Email is not associated with us")
            }
            let c_id = existingUser.id

            const data = await Collaborator.create({
                task_id,
                collaborators_id: c_id
            })

            return helper.success(res, `User ${existingUser?.email} accessed successfully`)
        } catch (err) {
            return helper.error(res, err)
        }
    },


    // EXTRA ( CHECK )
    minMaxDashbordCard: async (req, res) => {
        try {
            const { id, newStatus } = req.body;
            if (!typeof newStatus == "boolean") {
                return helper.error(res, "Required field missing")
            }

            let data = await DashbordCard.findOne({ where: { id: id } })
            data.is_close = newStatus
            data.save();

            return helper.success(res, "Dashbord card ... successfully", data)
        } catch (err) {
            return helper.error(res, err)
        }
    },

}