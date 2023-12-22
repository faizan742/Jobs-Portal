const express = require("express");
//const users=require('./Routes/users');
const sequelize = require("./Database/database");
const pino = require("pino");
const pinoPretty = require("pino-pretty");
const expressPino = require("express-pino-logger");
const logs = require("./Models/log");
const logsall=require('./Routes/logs');
const users = require("./Routes/users");
const jobs = require("./Routes/jobs");
const chat=require("./Routes/chatgpt");
const deleteTask=require('./Corn Task/DeleteJobs')
const corn = require('node-cron');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const cors = require("cors");
const logger = pino({ prettifier: pinoPretty });
const expressLogger = expressPino({ logger });
const rateLimit = require("express-rate-limit");
const { DATE } = require("sequelize");
const app = express();
const port = process.env.PORT || "8000";
const http = require('http');
const socketIo = require('socket.io');
const axios=require('axios');
const savechat=require('./Models/Chat');
const auths=require('./Routes/auth');
app.use(cors());
let UserInfo=[];
async function saveLogToDatabase(logData) {
  try {
    logs.create(logData);
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
    const auth_header = req.headers.authorization;
    if(!auth_header)  {
    saveLogToDatabase({
      username: req.hostname,
      method: req.method,
      status: res.statusCode,
      path: req.path,
      email: "NONE",
      userAgent: req.headers["user-agent"],
    });

   }else{
    const accessToken = auth_header.split(' ')[1]
    console.log(accessToken);
    UserInfo=jwt.decode(accessToken);
    saveLogToDatabase({
      username: req.hostname,
      method: req.method,
      status: res.statusCode,
      path: req.path,
      email: UserInfo.email,
      userName:UserInfo.username,
      userAgent: req.headers["user-agent"],
    });
   }
    
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
app.use("/logs", logsall);
app.use("/applicant", jobs);
app.use("/chat", chat);
app.use("/auth", auths);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = socketIo(server);


const CHATGPT_API_URL = 'http://192.168.11.178:3031/chat/CHATGPT';

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('chat message', async (message) => {
    try {
      await savechat.create({user:'user',message:message});   
      const response = await axios.post(CHATGPT_API_URL, { message });
          
      if(response.data.response==null,response.statusCode==429){
        await savechat.create({user:'CHATGPT',message:'YOUR LIMIT HAS REACHED'});
        socket.emit('chat message', 'YOUR LIMIT HAS REACHED');
      }else{
        await savechat.create({user:'CHATGPT',message:response.data.response});
        socket.emit('chat message', response.data.response);
      }      
    } catch (error) {
      console.error('Error processing message:', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});




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