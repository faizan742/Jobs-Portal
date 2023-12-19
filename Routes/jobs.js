const express = require('express');
const { where } = require('sequelize');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const path=require('path');
const { log } = require('console');
const jobs=require('../Models/jobs');
const multer = require('multer');
const uuid = require('uuid');
const downloadPDF=require('../Quene/downloadata');
const { request } = require('http');
const Middleware1=require('../Middleware/auth');
require("dotenv").config();

var jobsdata=[];

const Router = express.Router();
Router.use(express.json());
Router.use(express.urlencoded({ extended: true }));
var filename='';
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    name1=file.originalname.split('.');
    let uuid1=uuidv4();
   filename= name1[0] + '-' + uuid1+'.'+name1[1];
    cb(null,filename ); // File naming
  }
});




const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size if needed (in this case, 5MB)
}).single('cv');

const uploadFile = (req, res) => {

  return new Promise((resolve, reject) => {
  

    upload(req, res, async (err) => {
      console.log(req.body);
      if (err) {
        console.error(err);
        reject('An error occurred while uploading the file.');
      } else {
        if (!req.file) {
          reject('No file uploaded.');
        } else {
          const { userName, email, qualification, cnic, phoneNumber, age,address} = req.body;
          await jobs.create({userName:userName,email:email,qualification:qualification,

            cnic:cnic,phoneNumber: phoneNumber,address:address,
            cv: filename,age:age,isDelete:false
          }).then((result) => {
            return res.status(201).json({ message: 'Applicant created successfully', data: result });
          });
          
    
          resolve(req.file.originalname);
        }
      }
    
    });
      
  });
  
};

function updateOjectList(email,value) {
  for (let index = 0; index < alljobs.length; index++) {
    
    if(alljobs[index].email==email){
      alljobs[index].status=value;
    }
  }
}

Router.post('/upload',async (req, res) => {
  try {
    
    const uploadedFileName = await uploadFile(req, res);
    res.send(`File ${uploadedFileName} uploaded successfully.`);
    // Access req.file for details about the uploaded file (e.g., req.file.path)
    // Access uploadedFileName for the original name of the uploaded file
  } catch (error) {
    res.status(500).send(error);
  }
});




Router.route('/addJobs').post(async(req,res)=>{
  try {
      console.log(req.body);  
    
    
    const uploadedFileName = await uploadFile(req, res);
    console.log(uploadedFileName);
      

            

  } catch (error) {
  
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errorMessage = error.errors && error.errors.length > 0 ? error.errors[0].message : 'Validation error';
      return res.status(400).json({ error: errorMessage });
    }
    console.error('Error creating applicant:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
  
});

Router.route('/viewJobs').get(Middleware1.checkJWT,(req,res)=>{
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10; // Set a default page size
  
    const offset = (page - 1) * pageSize;
  
    jobs.findAll({
      where: { isDelete: false },
      limit: pageSize,
      offset: offset,
    })
      .then(result => {
        const totalJobs = result.count;
        const jobsData = result.map(job => job.toJSON());
  
        const response = {
          currentPage: page,
          pageSize: pageSize,
          totalJobs: totalJobs,
          jobs: jobsData,
        };
  
        res.json(response);
      })
      .catch(error => {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal server error' });
      });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
Router.route('/acceptJobs').get(Middleware1.checkJWT,async ( req,res)=>{
  try {
    
    await jobs.update({ status:'accepted' } ,{where:{email: email}},)
    updateOjectList(email,'accepted');
     res.send(200).json({message:'You Has Been Accepted'});
  } catch (error) {
   res.send(401);
   console.log(error);
  }
});

Router.route('/rejectJobs').get(Middleware1.checkJWT,async(req,res)=>{
  try {
    await jobs.update({ status:'rejected' } ,{where:{email: email}},)
    res.send(200).json({message:'You Has Been Rejected'});
  } catch (error) {
   res.send(401);
   console.log(error);
  }
});


Router.route('/deleteJobs').get(Middleware1.checkJWT,async(req,res)=>{
  try {
    await jobs.update({ isDelete:true } ,{where:{email: email}},)
     res.send(200).json({message:'You Has Been Rejected'});
      
  } catch (error) {
   res.send(401);
   console.log(error);
  }
});

Router.route('/downloadCV').get(Middleware1.checkJWT,(req,res)=>{
  try {
    downloadPDF.DownloadData(req.query.name);
    res.send(200).json({message:'CV HAS BEEN DOWNLOADED'});  
  } catch (error) {
   res.send(401);
   console.log(error);
  }
});

Router.route('/findJobs').get(Middleware1.checkJWT,async (req, res) => {
  try {
    acitivityJobs= await jobs.findAll({where:{isDelete:false}});
            
    const alljobs = await jobs.findAll({
      where: {
        [Op.or]: [
          { userName: { [Op.like]: `%${req.body.value}%` } }, // Case-insensitive search
          { status: { [Op.like]: `%${req.body.value}%` } },
           { email: { [Op.like]: `%${req.body.value}%` } }, // Case-insensitive email search
        ],
      },
    });

    if (alljobs.length === 0) {
      return res.status(401).send();
    } else {
      const allJobsCount = alljobs.length;
      const alljobsData = {
        'TOTAL DATA': acitivityJobs.length,
        'GOT RECORD': allJobsCount,
      };
      console.log(alljobs);
      const modifiedjobs = [alljobsData, ...alljobs.map(job1 => job1.toJSON())];
      return res.json(modifiedjobs);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


module.exports=Router;