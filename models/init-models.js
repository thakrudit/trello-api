var DataTypes = require("sequelize").DataTypes;
var _chat_room = require("./chat_room");

function initModels(sequelize) {
  var chat_room = _chat_room(sequelize, DataTypes);


  return {
    chat_room,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
