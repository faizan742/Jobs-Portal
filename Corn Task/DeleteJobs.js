const express = require('express');
const jobs=require('../Models/jobs');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require("dotenv").config();

async function CornTask() {
    result = await jobs.findAll({where:{status:'rejected'}});
    result.forEach(element => {
      fs.unlink(element.cv, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
          return;
        }
        console.log('File deleted successfully');
      });    
    });
  
    await jobs.update({ isDelete:true } ,{where:{status:'rejected'}},);
  
  }


  module.exports = {CornTask}; 
 