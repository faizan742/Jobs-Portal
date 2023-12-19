const express = require('express');
const { where } = require('sequelize');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const path=require('path');
const { log } = require('console');
const logs = require('../Models/log');
const Middleware1=require('../Middleware/auth')
require("dotenv").config();

const Router = express.Router();
Router.use(express.json());
Router.use(express.urlencoded({ extended: true }));



Router
.route(Middleware1.AdmincheckJWT,'/getLogs')
.get(async (req,res)=>{
  try {
   const allLogs  = await logs.findAll({where:{method:'POST'}});
    res.json(allLogs);
      
  } catch (error) {
   res.send(401);
   console.log(error);
  }
});




module.exports=Router;