var DataTypes = require("sequelize").DataTypes;
var _user_login_details = require("./user_login_details");

function initModels(sequelize) {
  var user_login_details = _user_login_details(sequelize, DataTypes);


  return {
    user_login_details,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
