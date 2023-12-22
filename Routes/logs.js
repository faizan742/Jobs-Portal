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
.route('/getLogs')
.get(Middleware1.AdmincheckJWT,async (req,res)=>{
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10; // Set a default page size
  
    const offset = (page - 1) * pageSize;
  
    const allLogs = await logs.findAll({
      where: { method: 'POST' },
      limit: pageSize,
      offset: offset,
    });
  
    const totalLogs =await logs.count();
    const logsData = allLogs.map(log => log.toJSON());
  
    const response = {
      currentPage: page,
      pageSize: pageSize,
      totalLogs: totalLogs,
      data: logsData,
    };
  
    res.json(response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




module.exports=Router;