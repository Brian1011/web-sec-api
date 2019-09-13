const Sequelize = require("sequelize");
const User = require("./user");
const Session = require("./session");
const config = require("config");

const sequelize = new Sequelize(
  config.get("db.database"),
  config.get("db.username"),
  config.get("db.password"),
  {
    host: config.get("db.host"),
    port: config.get("db.port"),
    dialect: "mysql",
    logging: false,
    define: {
      timestamps: false
    }
  }
);

sequelize.sync();

async function connect() {
  return sequelize.authenticate();
}

module.exports = {
  connect,
  user: new User(sequelize),
  session: new Session(sequelize)
};
