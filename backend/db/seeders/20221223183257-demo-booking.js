"use strict";

/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    options.tableName = "Bookings";
    return queryInterface.bulkInsert(
      options,
      [
        {
          spotId: 1,
          userId: 2,
          startDate: new Date("2023-01-01"),
          endDate: new Date("2023-01-03"),
        },
        {
          spotId: 2,
          userId: 3,
          startDate: new Date("2023-02-01"),
          endDate: new Date("2023-02-03"),
        },
        {
          spotId: 3,
          userId: 1,
          startDate: new Date("2023-03-01"),
          endDate: new Date("2023-03-03"),
        },
        {
          spotId: 2,
          userId: 2,
          startDate: new Date("2023-04-01"),
          endDate: new Date("2023-04-03"),
        },
        {
          spotId: 3,
          userId: 3,
          startDate: new Date("2023-05-01"),
          endDate: new Date("2023-05-03"),
        },
        {
          spotId: 1,
          userId: 1,
          startDate: new Date("2023-06-01"),
          endDate: new Date("2023-06-03"),
        },
        {
          spotId: 1,
          userId: 3,
          startDate: new Date("2023-07-01"),
          endDate: new Date("2023-07-03"),
        },
        {
          spotId: 2,
          userId: 1,
          startDate: new Date("2023-08-01"),
          endDate: new Date("2023-08-03"),
        },
        {
          spotId: 3,
          userId: 2,
          startDate: new Date("2023-09-01"),
          endDate: new Date("2023-09-03"),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = "Bookings";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        userId: { [Op.in]: [1, 2, 3] },
      },
      {}
    );
  },
};
