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

function generateRandomToken(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';

  for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      token += characters.charAt(randomIndex);
  }
  return token;
}

function hashPassword(password) {
  return bcrypt.hashSync(password, 6);
}

function generateExpirationTimestamp() {
  const expirationPeriodInMinutes = 20; 
  const now = new Date();
  now.setMinutes(now.getMinutes() + expirationPeriodInMinutes);
  return now;
}  

async function get_Expiration_Time_stamp_From_Database(token){
  re = await users.findOne({where:{rememberToken:token}});
  console.log(re);
  return re.dataValues.emailTime;
  

}

async function update_user(token,password){
  try {
    console.log(token,password);
        if (password === null || password === "") {
        
          res.send(400);
        } else {
        
          hashPasswords=hashPassword(password);
          await users.update({ rememberToken:"",isVerified:true,emailTime:"",password:hashPasswords } ,{where:{rememberToken:token}},)
          .then((result)=>{
          });
        }    
          
  } catch (error) {
    console.log(error);
  }
 
}

Router.route('/createuser').post(Middleware1.checkJWT,async (req,res)=>{
 const {firstName,lastName,email} = req.body;
  try {
    const validationResult = uservalidator.validation({firstName,lastName,email});
    if (validationResult.error) {
        console.error(validationResult.error.message);
        res.send(400);
      } else {
        
        let emailTime=generateExpirationTimestamp();
        let token=generateRandomToken(12);
        
        users.create({...req.body,password:'',rememberToken:token,emailTime:emailTime.toString()}).then((savedUser) => {      
        
          emailMethods.SendMAil(savedUser.email,token); 
          res.send(200);                 
        })
        .catch((error) => {
          res.send(401);
          console.error('Error saving user:', error);
        });

      }
} catch (error) {
  res.send(401);
  console.log('error',error); 
}    
});


Router.route('/createPassword/:token').post(async  (req, res) => {
    try {
    const token=req.params.token; 
    const password=req.body.password;
    console.log(token,password);
    const storedExpirationTimestamp = await get_Expiration_Time_stamp_From_Database(token); 
    const currentTimestamp = new Date();
    
    const time1=new Date(storedExpirationTimestamp);

    const time2=new Date(currentTimestamp.toString());
    
    if(storedExpirationTimestamp === ''){
      return res.sendStatus(400);
    }

    console.log(time1,time2);
    if (time1 < time2) {

      console.log('TOKEN EXPRIRE');
      res.sendStatus(400);
    } else if (time1 > time2 ) {
      console.log('TIME');
      await update_user(token,password);
      res.sendStatus(200);
    } else {
      console.log('TIME');
      await update_user(token,password);
      res.sendStatus(200);
    }
    
    } catch (error) {
  
        res.json(error);    
    }    
    });
    
Router.route('/findAll').get(Middleware1.checkJWT,async (req,res)=>{
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10; // Set a default page size
  
    const offset = (page - 1) * pageSize;
  
    const activityUsers = await users.findAll({
      where: {},
      limit: pageSize,
      offset: offset,
    });
  

    const totalCount = await users.count(); // Get total count for pagination
  
    res.json({
      data: activityUsers.map(user => user.toJSON()),
      currentPage: page,
      pageSize: pageSize,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error('Error querying database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
  
      
  });
  
Router.route('/login').post(async (req,res)=>{
  const  {email,password}=req.body;  
  try {
  
      const result1 = await users.findOne({where:{ email: email}});
  
      console.log(result1);
      bcrypt.compare(password, result1.dataValues.password, function(err, result) {
      
        if(err){
        console.log(err);
      }
        if (result) {
          const token = jwt.sign({ userId: result1.dataValues.userid, username: result1.dataValues.firstName
            ,admin:result1.dataValues.isAdmin,email:result1.dataValues.email}, process.env.Secret_KEY, { expiresIn: '1d' });
          console.log(token);
          
          res.json({email:result1.dataValues.email,username:result1.dataValues.username,token:token,isAdmin:result1.dataValues.isAdmin,
            isVerified:result1.dataValues.isVerified});  
      }
      else
      {
        res.send(400);
      } 
      });
      
    } catch (error) {
     res.send(401);
     console.log(error);
    }
  
    

  })

Router.route('/setPassword/:token').post(async (req,res)=>{

  const {password}=req.body;
  const token=req.params.token; 
    
  try {
      
    
    const storedExpirationTimestamp = await get_Expiration_Time_stamp_From_Database(token); 
    const currentTimestamp = new Date();
    
    const time1=new Date(storedExpirationTimestamp);

    const time2=new Date(currentTimestamp.toString());
    
    if(storedExpirationTimestamp === ''){
      return res.sendStatus(400);
    }
    console.log(time1,time2);
    if (time1 < time2) {

      console.log('TOKEN EXPRIRE');
      res.sendStatus(400);
    } else if (time1 > time2 ) {
      console.log('TIME');
      await update_user(token,password);
      res.sendStatus(200);
    } else {
      console.log('TIME');
      await update_user(token,password);
      res.sendStatus(200);
    }

    
    } catch (error) {
  
        res.json(error);    
    }
})

Router.route('/findUser').get(Middleware1.checkJWT,async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10; // Set a default page size
  
    const offset = (page - 1) * pageSize;
  
    const allUsers = await users.findAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.like]: `%${req.body.firstName}%` } }, // Case-insensitive search
          { lastName: { [Op.like]: `%${req.body.firstName}%` } },
          { email: { [Op.like]: `%${req.body.firstName}%` } }, // Case-insensitive email search
        ],
      },
      limit: pageSize,
      offset: offset,
    });
  
    const totalRecords = await allUsers.count();
    const usersData = allUsers.rows.map(user => user.toJSON());
  
    const response = {
      currentPage: page,
      pageSize: pageSize,
      totalRecords: totalRecords,
      data: usersData,
    };
  
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


Router.route('/forgetPassword').post(async (req,res)=>{
 const {email} = req.body;
  try {
    
    if (email==='' || email==null ) {
                res.send(400);
      } else {
        
        let emailTime=generateExpirationTimestamp();
        let token=generateRandomToken(12);
        
        users.update( {rememberToken:token,emailTime:emailTime.toString()} ,{where:{email: email}},).then(() => {      
        
          passwordMethods.SendMAil(email,token); 
          return res.send(200);                 
        })
        .catch((error) => {
          res.send(401);
          console.error('Error saving user:', error);
        });
        

      }
} catch (error) {
  res.send(401);
  console.log('error',error); 
}    
});

Router.route('/ResendEmail').post(async (req,res)=>{
 const {email} = req.body;
  try {
    
    if (email==='' || email==null ) {
                res.send(400);
      } else {
        
        let emailTime=generateExpirationTimestamp();
        let token=generateRandomToken(12);
        
        users.update( {rememberToken:token,emailTime:emailTime.toString()} ,{where:{email: email}},).then(() => {      
        
          passwordMethods.SendMAil(email,token); 
          return res.send(200);                 
        })
        .catch((error) => {
          res.send(401);
          console.error('Error saving user:', error);
        });
        

      }
} catch (error) {
  res.send(401);
  console.log('error',error); 
}    
});



module.exports=Router;