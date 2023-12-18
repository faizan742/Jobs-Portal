const express = require("express");
//const users=require('./Routes/users');
const sequelize = require("./Database/database");
const pino = require("pino");
const pinoPretty = require("pino-pretty");
const expressPino = require("express-pino-logger");
const log = require("./Models/log");
const users = require("./Routes/users");
const jobs = require("./Routes/jobs");
const deleteTask=require('./Corn Task/DeleteJobs')
const corn = require('node-cron');

require("dotenv").config();

const cors = require("cors");
const logger = pino({ prettifier: pinoPretty });

const expressLogger = expressPino({ logger });

const rateLimit = require("express-rate-limit");
const { DATE } = require("sequelize");
const app = express();
const port = process.env.PORT || "8000";
app.use(cors());

async function saveLogToDatabase(logData) {
  try {
    log.create(logData);
  } catch (error) {
    console.error("Error saving log to the database:", error);
  }
}

app.use((req, res, next) => {
  logger.info(
    { method: req.method, path: req.path, result: res.statusCode },
    "Request received"
  );
  console.log(req.headers);
  console.log(res.body);
  res.on("finish", async () => {
    saveLogToDatabase({
      username: req.hostname,
      method: req.method,
      status: res.statusCode,
      path: req.path,
      email: "NONE",
      userAgent: req.headers["user-agent"],
    });
  });
  next();
});

const limitrate = rateLimit({
  windowMs: 10000,
  max: 5,
  message: "Too many requests from this IP, please try again later.",
});

app.use(limitrate);
app.use(expressLogger);

app.use("/users", users);
app.use("/logs", log);
app.use("/jobs", jobs);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("HI There this is base ");
});

app.listen(port, (err) => {
  if (err) {
    return console.log("ERROR: " + err);
  }
  console.log("Listening on Port " + port);
});

app.set("view engine", "ejs");
app.set("views", "./View");


sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database: ", error);
  });

sequelize.sync();
corn.schedule('*/10 * * * *', deleteTask.CornTask);