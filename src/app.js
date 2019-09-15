const config = require("config");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const router = require("./router");
const db = require("./db");

const port = process.argv[2] || config.get("port") || 3000;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/", router);

db.connect().then(() => {
  app.listen(port, "0.0.0.0", err => {
    if (err) {
      console.log(err);
      process.exit();
    }
    console.log(`Server started on port ${port}`);
  });
});
