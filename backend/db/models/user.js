"use strict";
const { Model, Validator } = require("sequelize");
// using the bcryptjs package to compare the password and the hashedPassword
const bcrypt = require("bcryptjs");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    toSafeObject() {
      // This method will return an object with only the User instance information that is safe to save to a JWT, like id, username, and email.
      const { id, username, email } = this;
      // context will be the User instance
      return { id, username, email };
    }
    // Define an instance method validatePassword in the user.js model file. It should accept a password string and return true if there is a match with the User instance's hashedPassword. If there is no match, it should return false.
    validatePassword(password) {
      return bcrypt.compareSync(password, this.hashedPassword.toString());
    }
    //use currentUser scope to return a user with the id
    static getCurrentUserById(id) {
      return User.scope("currentUser").findByPk(id);
    }
    //  The method should search for one User with the specified credential (either a username or an email). If a user is found, then the method should validate the password by passing it into the instance's .validatePassword method. If the password is valid, then the method should return the user by using the currentUser scope.
    static async login({ credential, password }) {
      const { Op } = require("sequelize");
      const user = await User.scope("loginUser").findOne({
        where: {
          [Op.or]: {
            username: credential,
            email: credential,
          },
        },
      });
      if (user && user.validatePassword(password)) {
        return await User.scope("currentUser").findByPk(user.id);
      }
    }

    // Define a static method signup in the user.js model file that accepts an object with a username, email, and password key. Hash the password using the bcryptjs package's hashSync method. Create a User with the username, email, and hashedPassword. Return the created user using the currentUser scope.

    static async signup({ username, firstName, lastName, email, password }) {
      const hashedPassword = bcrypt.hashSync(password);
      const user = await User.create({
        username,
        firstName,
        lastName,
        email,
        hashedPassword,
      });
      return await User.scope("currentUser").findByPk(user.id);
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Booking, { foreignKey: "userId" });
      User.belongsToMany(models.Spot, {
        through: models.Booking,
        foreignKey: "userId",
        otherKey: "spotId",
      });
      User.hasMany(models.Review, { foreignKey: "userId" });

      User.hasMany(models.Spot, {
        foreignKey: "ownerId",
        onDelete: "CASCADE",
        hooks: true,
      });
    }
  }
  User.init(
    {
      firstName: {
        allowNull: false,
        type: DataTypes.STRING(30),
        validate: {
          len: [1, 30],
        },
      },
      lastName: {
        allowNull: false,
        type: DataTypes.STRING(30),
        validate: {
          len: [1, 30],
        },
      },
      username: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
        validate: {
          len: [4, 30],
          isNotEmail(value) {
            if (Validator.isEmail(value)) {
              throw new Error("Cannot be an email.");
            }
          },
        },
      },
      email: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING(256),
        validate: {
          len: [3, 256],
          isEmail: true,
        },
      },
      hashedPassword: {
        allowNull: false,
        type: DataTypes.STRING.BINARY,
        validate: {
          len: [60, 60],
        },
      },
    },
    {
      sequelize,
      modelName: "User",
      defaultScope: {
        attributes: {
          exclude: ["hashedPassword", "email", "createdAt", "updatedAt"],
        },
      },
      scopes: {
        currentUser: {
          attributes: { exclude: ["hashedPassword", "createdAt", "updatedAt"] },
        },
        loginUser: {
          attributes: {},
        },
      },
    }
  );
  return User;
};
