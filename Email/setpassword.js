require("dotenv").config();
const Queue = require('bull');
const nodemailer = require('nodemailer');
//const JobsModel=require("../Models/jobs");
//const failedJobsModel=require("../Models/failjobs");
//http://localhost:8080/admin/set-password/${token}

const passwordQueue = new Queue('ForgetEmail');
function SendMAil(email,token) {
  console.log('Send Email');
  console.log(email);
   passwordQueue.add({ 
    email: email, subject: 'Forget Password  Email', body:"Forget Password  Email Has been Send" ,html:`<html>
                <head>
                  <title>Test Email with Button</title>
                </head>
                <body>
                  <p>This is a test email with a button:</p>
                  <a href="http://localhost:8081/ResetPassword/${token} " target="_blank">
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
  passwordQueue.process((job, done) => {
    
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

passwordQueue.on('failed', (job, err) => {
 // const FEmail=new failedJobsModel({email:job.data.email});
  //FEmail.save();

  
  //console.error(`Job ${job.id} failed with error: ${err.message}`);
});
function pasueQuene() {
  passwordQueue.pause();
  passwordQueue.empty().then(() => {
    console.log('Queue emptied successfully.');
  }).catch((err) => {
    console.error('Error emptying the queue:', err);
  });
  passwordQueue.clean(0, 'failed').then(() => {
    console.log('Failed jobs removed successfully.');
  }).catch((err) => {
    console.error('Error removing failed jobs:', err);
  });
  passwordQueue.resume();
}
module.exports = {passwordQueue,SendMAil,pasueQuene}; // Export the emailQueue variable
