'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const env = process.env.APP_TYPE || 'development';
console.log("Current environment", env)
const config = {
  development: {
    username: process.env.DB_DEV_USER,
    password: process.env.DB_DEV_PASS,
    database: process.env.DB_DEV_DATA,
    host: process.env.DB_DEV_HOST,
    dialect: 'mysql',
  },
  production: {
    username: process.env.DB_PRO_USER,
    password: process.env.DB_PRO_PASS,
    database: process.env.DB_PRO_DATA,
    host: process.env.DB_PRO_HOST,
    dialect: 'mysql',
  },
};

const sequelize = new Sequelize(config[env]);
const db = {};

fs.readdirSync(__dirname)
  .filter(file => file !== basename && file.slice(-3) === '.js')
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.values(db).forEach(model => {
  if (model.associate) {
    model.associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

// npx sequelize-auto -o "D:\react-node\trello-api-03\models" -d trello-test -h 127.0.0.1 -u root -x "" -e mysql -t 
// npx sequelize-auto -o "D:\UserReact\trello-api\models" -d trello_test -h 127.0.0.1 -u root -x "" -e mysql -t 


// child_card_time
// created_at: {
//   type: DataTypes.DATE,
//   allowNull: false,
//   defaultValue: DataTypes.NOW,
// },