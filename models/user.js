import { DataTypes } from "sequelize"; //Sequelize or DataTypes is the same
import bcrypt from "bcrypt";
import db from "../config/db.js";

const User = db.define(
  "Users",
  {
    name: {
      type: DataTypes.STRING, //We do not complicate ourselves to know what type of data it is. Instead we put STRING
      allowNull: false, //Makes this field required
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token: DataTypes.STRING, //Since it is only one element, we omit the keys and pass the data type
    confirmed: DataTypes.BOOLEAN,
  },
  {
    hooks: {
      // Before creating a new user register, hash the password to store it securely
      beforeCreate: async function (user) {
        const salt = await bcrypt.genSalt(10); //Generate a salt for the password hash
        user.password = await bcrypt.hash(user.password, salt); //Replaces the password entered by the user with its hashed version
      },
    },
    scopes: {
      //Scopes are used to eliminate certain fields when you make a query to a specific model
      deletePassword: {
        attributes: {
          exclude: ["password", "token", "confirmed", "createdAt", "updatedAt"],
        },
      },
    },
  }
);

//Custom methods
User.prototype.verifyPassword = function (password) {
  //Can't use "this." with a arrow funtion
  return bcrypt.compareSync(password, this.password);
};

export default User;
