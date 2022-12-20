"use strict";
/** @type {import('sequelize-cli').Migration} */

//should also define the schema name for the Postgres production database in the options object at the top of the file, and include the options object in both the up and down functions.

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Users",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        firstName: {
          allowNull: false,
          type: Sequelize.STRING(30),
        },
        lastName: {
          allowNull: false,
          type: Sequelize.STRING(30),
        },
        username: {
          allowNull: false,
          unique: true,
          type: Sequelize.STRING(30),
        },
        email: {
          allowNull: false,
          unique: true,
          type: Sequelize.STRING(256),
        },
        hashedPassword: {
          allowNull: false,
          type: Sequelize.STRING.BINARY,
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
    options.tableName = "Users";
    await queryInterface.dropTable(options);
  },
};
