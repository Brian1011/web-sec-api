const Sequelize = require("sequelize");

class User {
  constructor(sequelize) {
    this.userDef = sequelize.define("users", {
      id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
      },
      phone: {
        type: Sequelize.STRING,
        unique: true
      },
      password: {
        type: Sequelize.STRING
      }
    });
  }

  async create(id, phone, password) {
    return this.userDef.create({
      id,
      phone,
      password
    });
  }

  async find(phone) {
    return this.userDef.findOne({ where: { phone } });
  }

  async findById(userId) {
    return this.userDef.findOne({
      where: { id: userId },
      attributes: { exclude: ["password"] },
      raw: true
    });
  }
}

module.exports = User;
