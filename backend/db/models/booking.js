"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Booking.belongsTo(models.Spot, { foreignKey: "spotId" });
      Booking.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  Booking.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
      spotId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Spots",
          key: "id",
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
      },
      startDate: {
        allowNull: false,
        type: DataTypes.DATE,
        validate: {
          isDate: true,
        },
      },
      endDate: {
        allowNull: false,
        type: DataTypes.DATE,
        validate: {
          isDate: true,
        },
      },
    },
    {
      sequelize,
      modelName: "Booking",
      defaultScope: {
        attributes: {
          include: [
            "id",
            "spotId",
            "userId",
            "startDate",
            "endDate",
            "createdAt",
            "updatedAt",
          ],
        },
      },
    }
  );
  return Booking;
};
