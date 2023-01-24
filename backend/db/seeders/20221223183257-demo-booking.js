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
          endDate: new Date("2023-01-06"),
        },
        {
          spotId: 2,
          userId: 3,
          startDate: new Date("2023-02-01"),
          endDate: new Date("2023-02-06"),
        },
        {
          spotId: 3,
          userId: 1,
          startDate: new Date("2023-03-01"),
          endDate: new Date("2023-03-06"),
        },
        {
          spotId: 1,
          userId: 3,
          startDate: new Date("2023-04-01"),
          endDate: new Date("2023-04-06"),
        },
        {
          spotId: 2,
          userId: 1,
          startDate: new Date("2023-05-01"),
          endDate: new Date("2023-05-06"),
        },
        {
          spotId: 3,
          userId: 2,
          startDate: new Date("2023-06-01"),
          endDate: new Date("2023-06-06"),
        },
        {
          spotId: 1,
          userId: 2,
          startDate: new Date("2023-07-01"),
          endDate: new Date("2023-07-06"),
        },
        {
          spotId: 2,
          userId: 3,
          startDate: new Date("2023-08-01"),
          endDate: new Date("2023-08-06"),
        },
        {
          spotId: 3,
          userId: 1,
          startDate: new Date("2023-09-01"),
          endDate: new Date("2023-09-06"),
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
    await queryInterface.bulkDelete(options, null, {});
    // const Op = Sequelize.Op;
    // return queryInterface.bulkDelete(
    //   options,
    //   {
    //     id: { [Op.in]: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    //   },
    //   {}
    // );
  },
};
