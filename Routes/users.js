const express = require('express');
const { where } = require('sequelize');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const path=require('path');
const { log } = require('console');
const users=require('../Models/users');
const uservalidator=require('../Validators/usersvalidator');
const bcrypt = require('bcrypt');
const emailMethods= require('../Email/emailquene');
const passwordMethods= require('../Email/setpassword');
const { token } = require('morgan');
const Middleware1=require('../Middleware/auth');
var jwt = require('jsonwebtoken');
require("dotenv").config();

const Router = express.Router();
Router.use(express.json());
Router.use(express.urlencoded({ extended: true }));


Router.route('/profile').get(Middleware1.checkJWT,async (req,res)=>{
  try {
   
    const allUsers = await users.findAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.like]: `%${req.body.firstName}%` } }, 
        ],
      },
    });
  
    const usersData = allUsers.rows.map(user => user.toJSON());

    const response = {
      data: usersData,
    };
  
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
 
    

})




module.exports=Router;