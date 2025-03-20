const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('boards', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    bg_color: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    visibility: {
      type: DataTypes.ENUM('Private','Workspace','Public'),
      allowNull: false,
      comment: "0-private, 1-workspace, 2-public"
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_bord_close: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'boards',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
