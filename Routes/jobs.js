const express = require('express');
const { where } = require('sequelize');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const path=require('path');
const { log } = require('console');
const logs=require('../Models/log');

require("dotenv").config();

const Router = express.Router();
Router.use(express.json());
Router.use(express.urlencoded({ extended: true }));



Router
.route('/getjobs')
.get((req,res)=>{
  try {
    
      
  } catch (error) {
   res.send(401);
   console.log(error);
  }
});




module.exports=Router;