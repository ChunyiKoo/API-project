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
    options.tableName = "Spots";
    return queryInterface.bulkInsert(
      options,
      [
        {
          ownerId: 1,
          address: "123 Wall streat",
          city: "Seattle",
          state: "Washington",
          country: "United States of America",
          lat: 47.3582575,
          lng: -119.7665427,
          name: "App Academy 1",
          description: "Place 1 where web developers are created",
          price: 123,
        },
        {
          ownerId: 2,
          address: "123 Disney Lane",
          city: "San Francisco",
          state: "California",
          country: "United States of America",
          lat: 37.7645358,
          lng: -122.4730327,
          name: "App Academy 2",
          description: "Place 2 where web developers are created",
          price: 273,
        },
        {
          ownerId: 3,
          address: "548 Vanderbilt Ave",
          city: "Staten island",
          state: "New York",
          country: "United States of America",
          lat: 40.7195358,
          lng: -74.0072019,
          name: "App Academy 3",
          description: "Place 3 where web developers are created",
          price: 389,
        },
        {
          ownerId: 1,
          address: "123 Mango streat",
          city: "San Diego",
          state: "California",
          country: "United States of America",
          lat: 31.3582575,
          lng: -119.7665427,
          name: "App Academy 4",
          description: "Place 4 where web developers are created",
          price: 93,
        },
        {
          ownerId: 2,
          address: "1555 Happy Lane",
          city: "Silver Mt",
          state: "Idaho",
          country: "United States of America",
          lat: 75.7645358,
          lng: -155.4730327,
          name: "App Academy 5",
          description: "Place 5 where web developers are created",
          price: 55,
        },
        {
          ownerId: 3,
          address: "48 Cherry Street",
          city: "Oroville",
          state: "Michigan",
          country: "United States of America",
          lat: 76.7195358,
          lng: -156.0072019,
          name: "App Academy 6",
          description: "Place 6 where web developers are created",
          price: 76,
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
    options.tableName = "Spots";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        name: {
          [Op.in]: [
            "App Academy 1",
            "App Academy 2",
            "App Academy 3",
            "App Academy 4",
            "App Academy 5",
            "App Academy 6",
          ],
        },
      },
      {}
    );
  },
};
