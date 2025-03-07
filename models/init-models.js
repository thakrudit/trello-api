var DataTypes = require("sequelize").DataTypes;
var _boards = require("./boards");

function initModels(sequelize) {
  var boards = _boards(sequelize, DataTypes);


  return {
    boards,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
