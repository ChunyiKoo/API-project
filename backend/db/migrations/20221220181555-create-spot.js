"use strict";
/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Spots",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        ownerId: {
          type: Sequelize.INTEGER,
          references: {
            model: "Users",
          },
        },
        address: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        city: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        state: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        country: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        lat: {
          type: Sequelize.DECIMAL(9, 7),
        },
        lng: {
          type: Sequelize.DECIMAL(10, 7),
        },
        name: {
          type: Sequelize.STRING(50),
        },
        description: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        price: {
          allowNull: false,
          type: Sequelize.DECIMAL,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      },
      options
    );
  },
  async down(queryInterface, Sequelize) {
    options.tableName = "Spots";
    await queryInterface.dropTable(options);
  },
};
