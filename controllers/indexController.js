const helper = require("../config/helper")
const db = require("../models")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { Op, Sequelize } = require("sequelize")
const randomstring = require("randomstring")
const screenshot = require('screenshot-desktop')
const fs = require("fs")
const path = require('path');

const User = db.users;
const Board = db.boards;
const DashbordCard = db.dashbord_cards;
const ChildCard = db.child_card;
const Collaborator = db.collaborators_access;
const ChildCardTime = db.child_card_time;
const Notification = db.notification;
const Screenshots = db.card_screenshots;
const Chat = db.chat;
const Message = db.message;
const GroupUsers = db.group_users;
const ChatRoom = db.chat_room;
const MessageRoom = db.message_room;

Board.hasMany(DashbordCard, { foreignKey: "board_id" })
DashbordCard.hasMany(ChildCard, { foreignKey: "dashbord_c_id" })
ChildCard.hasMany(ChildCardTime, { foreignKey: "c_id" })

User.hasMany(Board, { foreignKey: "user_id" })

Board.belongsToMany(User, { through: Collaborator, foreignKey: "board_id", otherKey: "collaborators_id" });
// User.belongsToMany(Board, { through: Collaborator, foreignKey: "collaborators_id", otherKey: "board_id" });

ChatRoom.hasMany(GroupUsers, { foreignKey: "chat_id" })

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
            const privateKey = process.env.JWT_SECRET;
            const token = jwt.sign({ data: credentials }, privateKey);

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

            const user = await User.findOne({
                where: { email }
            });
            if (!user) {
                return helper.error(res, 'Invalid Email');
            }

            const compPassword = await bcrypt.compare(password, user.password);
            if (!compPassword) {
                return helper.error(res, 'Incorrect Password');
            }

            const payload = { id: user.id, email: user.email }
            const privateKey = process.env.JWT_SECRET;
            const token = jwt.sign({ data: payload }, privateKey);

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
                attributes: ['board_id'],
                where: { collaborators_id: id },
            });
            const boardIds = collaboratorBoards.map(collab => collab.board_id);

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
            return helper.success(res, "List created successfully", data)
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
            return helper.success(res, "Card created successfully", data) // !data
        } catch (err) {
            return helper.error(res, err)
        }
    },

    getChildCard: async (req, res) => {
        try {
            const { id } = req.user;
            const { c_id } = req.query;
            if (!c_id) {
                return helper.error(res, "Required field missing")
            }

            let user = await User.findOne({
                attributes: ["name"],
                where: { id }
            })

            let history = await ChildCard.findOne(
                {
                    where: { id: c_id },
                    include: [
                        {
                            attributes: ['user_name', 'duration', 'created_at'],
                            model: ChildCardTime, // as history
                            separate: true,
                            order: [['id', 'DESC']],
                        }
                    ]
                }
            )
            if (!history) {
                return helper.error(res, "Card not found")
            }

            const totalTime = history?.child_card_times.reduce((sum, record) => sum + record.duration, 0)

            let data = {
                history,
                totalTime,
                user
            }

            return helper.success(res, "Card getting successfully", data)
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
            const { id, name } = req.user;
            const { board_id, collaborator_email } = req.body;
            if (!board_id && !collaborator_email) {
                return helper.error(res, "Required field missing")
            }

            let board = await Board.findOne({
                attributes: ["id", "title", "user_id"],
                where: {
                    id: board_id,
                }
            })

            if (board.user_id != id) {
                return helper.error(res, "User have no permssion")
            }

            let existingUser = await User.findOne({
                attributes: ["id"],
                where: { email: collaborator_email }
            })
            if (!existingUser) {
                return helper.error(res, "Email is not associated with us")
            }
            let co_id = existingUser.id

            if (id === co_id) {
                return helper.error(res, "This is your own email")
            }

            const check_exist = await Collaborator.findOne({ where: { board_id, collaborators_id: co_id } })
            if (!!check_exist) {
                return helper.error(res, "User already have access")
            }

            const data = await Collaborator.create({
                board_id,
                collaborators_id: co_id
            })

            let message = `${name} sent you a colleborator request for board ${board.title}`
            await helper.sendNotification(id, co_id, board_id, message)
            return helper.success(res, `User accessed successfully`, {})
        } catch (err) {
            return helper.error(res, err)
        }
    },

    getNotification: async (req, res) => {
        try {
            const { id } = req.user;

            const data = await Notification.findAll({ where: { reciver_id: id } })
            if (!data) {
                return helper.error(res, "No Notifcations")
            }

            return helper.success(res, `Notification getting successfully`, data)
        } catch (err) {
            return helper.error(res, err)
        }
    },

    updateTime: async (req, res) => {
        try {
            const { id, name } = req.user;
            const { c_id, duration } = req.body;

            if (!c_id || !duration) {
                return helper.error(res, "Required field missing")
            }

            let firstName = name?.split(' ')[0]

            const dataN = await ChildCardTime.create({
                c_id,
                duration,
                user_id: id,
                user_name: firstName
            })

            let history = await ChildCardTime.findAll({
                attributes: ['user_name', 'duration', 'created_at'],
                where: { c_id },
                separate: true,
                order: [['id', 'DESC']],
            })

            const totalTime = history.reduce((sum, record) => sum + record.duration, 0)

            let data = {
                history,
                totalTime
            }

            return helper.success(res, `Time setting successfully`, data)
        } catch (err) {
            return helper.error(res, err)
        }
    },

    screenShot: async (req, res) => {
        try {
            const { card_id } = req.body;
            if (!card_id) {
                return helper.error(res, "Missing field is required")
            }
            let result = randomstring.generate(10) + ".png";

            let savePath1 = path.join(process.cwd())

            let savePath = path.join(process.cwd(), 'public/uploads', result);

            await screenshot({ filename: savePath });

            const fileUrl = `https://trello-api-n7fb.onrender.com/uploads/${result}`;

            const data = await Screenshots.create({
                card_id,
                url: result
            })

            return helper.success(res, "Screenshot captured", fileUrl)
        } catch (err) {
            return helper.error(res, err)
        }
    },

    getBoardUsers: async (req, res) => {
        try {
            const { id } = req.user;
            const { board_id } = req.query;
            if (!board_id) {
                return helper.error(res, "Missing field is required")
            }

            let boardOwner = await Board.findOne({
                attributes: ["user_id"],
                where: {
                    id: board_id
                }
            })

            let otherUsers = await Collaborator.findAll({
                attributes: ["collaborators_id"],
                where: {
                    board_id
                }
            })

            let collaboratorsArray = otherUsers.map(user => user.collaborators_id);

            let allUsers = [boardOwner.user_id, ...collaboratorsArray];

            if (!allUsers.includes(id)) {
                return helper.error(res, "No permission");
            }

            const data = await User.findAll({
                attributes: ["id", "name"],
                where: {
                    id: allUsers
                }
            })

            return helper.success(res, "Board user getting successfully", data)
        } catch (err) {
            return helper.error(res, err)
        }
    },

    /////////////////////////////
    // createNewChat: async (req, res) => {
    //     try {
    //         const { id } = req.user;
    //         const { user_2 } = req.body;

    //         if (!user_2) {
    //             return helper.error(res, "Required field missing")
    //         }

    //         let chat = await Chat.findOne({
    //             where: {
    //                 [Op.or]: [
    //                     { user_1: id, user_2: user_2 },
    //                     { user_1: user_2, user_2: id },
    //                 ],
    //             },
    //         });

    //         if (!chat) {
    //             console.log("+++++ new chat +++++")
    //             chat = await Chat.create({ user_1: id, user_2 });
    //         }

    //         return helper.success(res, "Chat Created successfully", chat);
    //     } catch (err) {
    //         return helper.error(res, err)
    //     }
    // },

    // sendMessage: async (req, res) => {
    //     try {
    //         const { id } = req.user
    //         const { chat_id, message } = req.body

    //         if (!chat_id || !message) {
    //             return helper.error(res, "Required field missing")
    //         }

    //         const data = await Message.create({
    //             sender_id: id,
    //             message,
    //             chat_id,
    //         })

    //         return helper.success(res, "Message send successful", data)
    //     } catch (err) {
    //         return helper.error(res, err)
    //     }
    // },

    // getMessages: async (req, res) => {
    //     try {
    //         const { chat_id } = req.query;

    //         if (chat_id == null) {
    //             return helper.error(res, "Required field missing")
    //         }

    //         let chat = await Message.findAll({
    //             where: {
    //                 chat_id
    //             }
    //         })
    //         return helper.success(res, "Messages getting successful", chat)
    //     } catch (err) {
    //         return helper.error(res, err)
    //     }
    // },

    // getAllUsers: async (req, res) => {
    //     try {
    //         let data = await User.findAll({
    //             attributes: ["id", "name", "email"]
    //         })
    //         return helper.success(res, "All users getting successfully", data);
    //     } catch (err) {
    //         return helper.error(res, err)
    //     }
    // },
    /////////////////////////////

    createChatRoom: async (req, res) => {
        try {
            const { id } = req.user;
            const { configData } = req.body
            let group_user_ids = configData?.group_users?.map(item => item.id);

            // console.log("createChatRoom configData", configData)
            // console.log(group_user_ids)

            // FOE SINGLE CHAT
            if (!configData.is_group) {
                if (!configData.user_2) {
                    return helper.error(res, "Required field missing")
                }
                let chat = await ChatRoom.findOne({
                    where: {
                        [Op.or]: [
                            { user_1: id, user_2: configData?.user_2 },
                            { user_1: configData?.user_2, user_2: id },
                        ],
                    },
                });

                if (!chat) {
                    chat = await ChatRoom.create({
                        is_group: configData.is_group, // ""
                        group_name: configData.group_name, // ""
                        group_board_id: configData.group_board_id, // ""
                        user_1: id,
                        user_2: configData.user_2,
                    })
                }

                return helper.success(res, "Single Chat joined successfully", chat);
            }

            // GET EXISTING GROUP CHAT
            let existingChat = await ChatRoom.findOne({
                where: {
                    is_group: true,
                    group_board_id: configData.group_board_id,
                },
                include: [
                    {
                        model: GroupUsers,
                        attributes: ['user_id'],
                        required: true,
                    },
                ]
            })

            if (existingChat) {
                const existingUserIds = existingChat.group_users.map(user => user.user_id);
                const missingUserIds = group_user_ids.filter(id => !existingUserIds.includes(id));

                if (missingUserIds.length > 0) {
                    await GroupUsers.bulkCreate(
                        missingUserIds.map(user_id => ({
                            chat_id: existingChat.id,
                            user_id
                        }))
                    );
                }

                return helper.success(res, "User joined chat successfully", existingChat);
            }

            // CREATE NEW GROUP CHAT
            let chat = await ChatRoom.create({
                is_group: configData.is_group,
                group_name: configData.group_name,
                group_board_id: configData.group_board_id,
                user_1: configData.user_1,
                user_2: configData.user_2,
            })

            if (!chat) {
                return helper.error(res, "Chat room not found")
            }

            await GroupUsers.bulkCreate(
                group_user_ids.map(user_id => ({
                    chat_id: chat.id,
                    user_id
                }))
            );

            return helper.success(res, "Group Chat joined successfully", chat);
        } catch (err) {
            return helper.error(res, err)
        }
    },

    sendChatMessage: async (req, res) => {
        try {
            const { id } = req.user
            const { chat_room_id, message } = req.body

            if (!chat_room_id || !message) {
                return helper.error(res, "Required field missing")
            }

            const data = await MessageRoom.create({
                sender_id: id,
                message,
                chat_room_id,
            })

            return helper.success(res, "Chat Room Message send successful", data)
        } catch (err) {
            return helper.error(res, err)
        }
    },

    getChatRoomMessages: async (req, res) => {
        try {
            const { chat_room_id } = req.query;

            if (chat_room_id == null) {
                return helper.error(res, "Required field missing")
            }

            let chat = await MessageRoom.findAll({
                where: {
                    chat_room_id
                }
            })
            return helper.success(res, "Chat Room Messages getting successful", chat)
        } catch (err) {
            return helper.error(res, err)
        }
    },


    // NOT IN USE
    fileUpload: async (req, res) => {
        try {
            const attatchment = req.files.file;
            const file_name = attatchment.name
            const file_extension = file_name.split(".")[1];
            let result = randomstring.generate(10) + "." + file_extension;

            attatchment.mv(process.cwd() + `/public/uploads/${result}`, function (err) {
                if (err) throw err
            });

            const name = "https://trello-api-n7fb.onrender.com/uploads/" + result
            return helper.success(res, "File uploaded successfully", name);
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