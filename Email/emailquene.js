require("dotenv").config();
const Queue = require('bull');
const nodemailer = require('nodemailer');
//const JobsModel=require("../Models/jobs");
//const failedJobsModel=require("../Models/failjobs");

//http://localhost:${process.env.PORT}/users/createPassword/${email}/${token}
const emailQueue = new Queue('UserVerficationEmail');
function SendMAil(email,token) {
  console.log('Send Email');
  console.log(email);
   emailQueue.add({ 
    email: email, subject: 'Verfication Email', body:"Verfication Email Has been Send" ,html:`<html>
                <head>
                  <title>Test Email with Button</title>
                </head>
                <body>
                  <p>This is a test email with a button:</p>
                  <a href=" http://localhost:8081/setPassword/${token}" target="_blank">
                    <button>Click me!</button>
                  </a>
                </body>
              </html>` 
            });
            

            }




const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USERMAIL,
      pass: process.env.Password,
    }
  });
  emailQueue.process((job, done) => {
    
    const mailOptions = {
          from: process.env.USERMAIL,
          to: job.data.email,
          subject: job.data.subject,
          text: job.data.body,
          html:job.data.html
        };
    
    transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error:', error);
              //const FEmail=new failedJobsModel({email:mailOptions.to});
              //FEmail.save();
            } else {
              console.log('Email sent:', info.response);
              // JobsModel.deleteOne({email:mailOptions.to}).then((result) => {
                   
              // }).catch((err) => {
              //   console.log('ERROR A G');
              // });
              

              
            }
          });

 
  });

emailQueue.on('failed', (job, err) => {
 // const FEmail=new failedJobsModel({email:job.data.email});
  //FEmail.save();

  
  //console.error(`Job ${job.id} failed with error: ${err.message}`);
});
function pasueQuene() {
  emailQueue.pause();
  emailQueue.empty().then(() => {
    console.log('Queue emptied successfully.');
  }).catch((err) => {
    console.error('Error emptying the queue:', err);
  });
  emailQueue.clean(0, 'failed').then(() => {
    console.log('Failed jobs removed successfully.');
  }).catch((err) => {
    console.error('Error removing failed jobs:', err);
  });
  emailQueue.resume();
}
module.exports = {emailQueue,SendMAil,pasueQuene}; // Export the emailQueue variable
