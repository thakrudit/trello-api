const db = require("../models")
const Notification = db.notification;

module.exports = {
    unauth: function (res, err, body = {}) {
        console.log(err, '===========================>error');
        let code = (typeof err === 'object') ? (err.code) ? err.code : 401 : 401;
        let message = (typeof err === 'object') ? (err.message ? err.message : '') : err;
        res.status(code).json({
            'success': false,
            'code': code,
            'message': message,
            'body': body
        });

    },

    success: function (res, message = '', body = {}) {
        return res.status(200).json({
            'success': true,
            'code': 200,
            'message': message,
            'body': body
        })
    },

    error: function (res, error, body = {}) {
        console.log(error, '============================>error');
        let code = (typeof error === 'object') ? (error.code ? error.code : 200) : 400
        let message = (typeof error === 'object') ? (error.message ? error.message : '') : error
        return res.status(200).json({
            'success': false,
            'code': code,
            'message': message,
            'body': body
        })
    },

    permission: function (res, err, body = {}) {
        let code = (typeof err === 'object') ? (err.code) ? err.code : 403 : 403;
        let message = (typeof err === 'object') ? (err.message ? err.message : '') : err;
        res.status(code).json({
            'success': false,
            'code': code,
            'message': message,
            'body': body
        });
    },

    sendNotification: async (sender_id, reciver_id, board_id, message, invitation) => {
        try {
            const notification = await Notification.create({
                sender_id,
                reciver_id,
                board_id,
                message,
                invitation
            });
            return notification;
        } catch (error) {
            throw error;
        }
    }
}