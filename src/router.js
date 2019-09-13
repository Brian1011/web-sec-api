const express = require("express");
const uuid = require("uuid/v1");
const crypto = require("crypto");
const moment = require("moment");
const db = require("./db");
const scrypt = require("scrypt");

const app = express();

const scryptParameters = scrypt.paramsSync(0.1);

app.use("*", (req, _res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);

  next();
});

const authMiddleware = async (req, res, next) => {
  const reqSession = req.cookies.session || req.header("session");
  const deviceId = req.header("DeviceId");
  const deviceName = req.header("DeviceName");

  if (!reqSession) {
    res.status(401).send({ message: "No authentication provided" });
    return;
  }

  const dbSession = await db.session.find(reqSession);
  if (!dbSession) {
    res.status(403).send({ message: "Invalid Session" });
    return;
  }

  if (dbSession.deviceId != deviceId || dbSession.deviceName != deviceName) {
    res.status(403).send({ message: "Invalid session for current device" });
    return;
  }

  await db.session.updateLastDate(reqSession, moment().unix());

  req.userId = dbSession.userId;

  next();
};

app.post("/register", async (req, res) => {
  const phone = req.body.phone;
  const password = req.body.password;

  // Validate request parameters
  if (!phone || !password) {
    res.status(400).send({ message: "Missing parameters" });
    return;
  }

  // Hash password
  const hash = scrypt.kdfSync(password, scryptParameters).toString("hex");

  // Generate a user's id
  const uid = uuid().replace(new RegExp("-", "g"), "");

  try {
    // Create user
    await db.user.create(uid, phone, hash);

    res.send({ id: uid, phone });
  } catch (e) {
    res.status(500).send(parseDbError(e));
  }
});

app.post("/login", async (req, res) => {
  const phone = req.body.phone;
  const password = req.body.password;
  const deviceName = req.header("DeviceName");
  const deviceId = req.header("DeviceId");

  // Validate request parameters
  if (!phone || !password || !deviceName || !deviceId) {
    res.status(400).send({ message: "Missing parameters" });
    return;
  }

  // Verify user exists
  const userFromDb = await db.user.find(phone);
  if (!userFromDb) {
    res.status(404).send({ message: "User does not exist" });
    return;
  }

  // Verify password
  if (
    !scrypt.verifyKdfSync(Buffer.from(userFromDb.password, "hex"), password)
  ) {
    res.status(401).send({ message: "Invalid password" });
    return;
  }

  // Create new session
  const session = generateSession();
  const sessionExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365); // 1 year
  const createdDate = moment().unix();
  const lastUseDate = moment().unix();

  // Save session
  await db.session.create(
    session,
    userFromDb.id,
    createdDate,
    lastUseDate,
    deviceId,
    deviceName
  );

  // Send response
  res.set(
    "Set-Cookie",
    `session=${session}; Expires=${sessionExpiry}; HttpOnly `
  );
  res.send({ user: { id: userFromDb.id, phone: userFromDb.phone }, session });
});

app.post("/logout", authMiddleware, async (req, res) => {
  const reqSession = req.cookies.session || req.header("session");
  await db.session.delete(reqSession);

  const sessionExpiry = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365); // Old expiry deletes a cookie
  res.set("Set-Cookie", `session=; Expires=${sessionExpiry}; HttpOnly `);
  res.send({ message: "OK" });
});

app.delete("/session", authMiddleware, async (req, res) => {
  // Get details of the session used to authenticate the request
  const authSession = req.cookies.session || req.header("session");
  const authSessionDetails = await db.session.find(authSession);

  // Validate that a session id was passed
  const deletionSessionId = req.body.sessionId;
  if (!deletionSessionId) {
    res.status(400).send({ message: "No session provided" });
    return;
  }

  // Get details of the session to be deleted
  const deletionSessionDetails = await db.session.findById(deletionSessionId);

  // No need to return an error when trying to delete a none existent session
  if (!deletionSessionDetails) {
    res.send({ message: "OK" });
    return;
  }

  // Ensure that the user is not deleting a session they don't own
  // Do not specify that the session exists
  if (authSessionDetails.userId != deletionSessionDetails.userId) {
    res.status(403).send({ message: "Session does not exist" });
    return;
  }

  // Delete the session
  await db.session.delete(deletionSessionDetails.session);

  res.send({ message: "OK" });
});

app.get("/sessions", authMiddleware, async (req, res) => {
  const reqSession = req.cookies.session || req.header("session");
  const session = await db.session.find(reqSession);

  const result = await db.session.findForUser(session.userId);

  res.send(result);
});

app.get("/profile", authMiddleware, async (req, res) => {
  const user = await db.user.findById(req.userId);
  res.send(user);
});

function generateSession() {
  return crypto.randomBytes(32).toString("base64");
}

function parseDbError(e) {
  if (e.name == "SequelizeUniqueConstraintError") {
    const errMessage = e.errors.map(err => err.message).join(";");
    console.log(errMessage);
    return { message: errMessage };
  } else {
    console.log(e.message);
    return { message: e.name };
  }
}

module.exports = app;
