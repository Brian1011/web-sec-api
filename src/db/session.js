const Sequelize = require("sequelize");

class Session {
  constructor(sequelize) {
    this.sessionDef = sequelize.define("sessions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      userId: {
        type: Sequelize.STRING
      },
      session: {
        type: Sequelize.STRING,
        unique: true
      },
      createdDate: {
        type: Sequelize.BIGINT
      },
      lastUseDate: {
        type: Sequelize.BIGINT
      },
      deviceId: {
        type: Sequelize.STRING
      },
      deviceName: {
        type: Sequelize.STRING
      },
      activationCode: {
        type: Sequelize.STRING
      },
      activated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    });
  }

  async create(
    session,
    userId,
    createdDate,
    lastUseDate,
    deviceId,
    deviceName,
    activationCode
  ) {
    return this.sessionDef.create({
      session,
      userId,
      createdDate,
      lastUseDate,
      deviceId,
      deviceName,
      activationCode
    });
  }

  async find(session) {
    return this.sessionDef.findOne({ where: { session }, raw: true });
  }

  async findById(id) {
    return this.sessionDef.findOne({ where: { id }, raw: true });
  }

  async findForUser(userId) {
    return this.sessionDef.findAll({
      where: { userId },
      attributes: { exclude: ["session", "userId"] },
      raw: true
    });
  }

  async updateLastDate(session, lastUseDate) {
    return this.sessionDef.update({ lastUseDate }, { where: { session } });
  }

  async setSessionActivated(session) {
    return this.sessionDef.update({ activated: true }, { where: { session } });
  }

  async delete(session) {
    return this.sessionDef.destroy({ where: { session }, raw: true });
  }
}

module.exports = Session;
