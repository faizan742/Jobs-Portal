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
  const expirationPeriodInMinutes = 9; 
  const now = new Date();
  now.setMinutes(now.getMinutes() + expirationPeriodInMinutes);
  return now;
}  

async function get_Expiration_Time_stamp_From_Database(email){
  re = await users.findOne({where:{email:email}});
  console.log(re);
  return re.dataValues.emailTime;
  

}



async function update_user(email,token,password){
  try {
    console.log(email,token,password);
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

Router.route('/createuser').post(async (req,res)=>{
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
    const storedExpirationTimestamp = await get_Expiration_Time_stamp_From_Database(email); 
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
      await update_user(email,token,password);
    } else {
      console.log('TIME');
      await update_user(email,token,password);
    }
    res.sendStatus(200);
    } catch (error) {
  
        res.json(error);    
    }    
    });
    
Router.route('/findAll').get(async (req,res)=>{
     try {
      const acitivityusers= await users.findAll({where:{}});
          users.findAll()
            .then(users => {
              console.log('Users found:', users);
              users=users.map(user => user.toJSON())
              res.json(users);
            })
            .catch(error => {
              console.error('Error querying database:', error);
              res.json(401);
            });
     } catch (error) {
      res.send(401);
      console.log(error);
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
          
          res.json({email:result1.dataValues.email,username:result1.dataValues.username,jwt:token,isAdmin:result1.dataValues.isAdmin,
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
  const email = req.params.email;
  const {password}=req.body;
  const token=req.params.token; 
    
  try {
      
    
    const storedExpirationTimestamp = await get_Expiration_Time_stamp_From_Database(email); 
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
      await update_user(email,token,password);
    } else {
      console.log('TIME');
      await update_user(email,token,password);
    }
    res.sendStatus(200);
    } catch (error) {
  
        res.json(error);    
    }
})

Router.route('/findUser').get(async (req, res) => {
  try {
    const acitivityusers= await users.findAll({where:{}});
    const allusers = await users.findAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.like]: `%${req.body.firstName}%` } }, // Case-insensitive search
          { lastName: { [Op.like]: `%${req.body.firstName}%` } },
           { email: { [Op.like]: `%${req.body.firstName}%` } }, // Case-insensitive email search
        ],
      },
    });

    if (allusers.length === 0) {
      return res.status(401).send();
    } else {
      const allusersCount = allusers.length;
      const allusersData = {
        'TOTAL DATA': acitivityusers.length,
        'GOT RECORD': allusersCount,
      };
      console.log(allusers);
      const modifieduser = [allusersData, ...allusers.map(user => user.toJSON())];
      return res.json(modifieduser);
    }
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













module.exports=Router;